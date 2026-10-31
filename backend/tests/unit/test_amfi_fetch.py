import hashlib

import pytest
import requests

from app.services import amfi
from app.services.amfi import AMFIError


class FakeResponse:
    def __init__(self, content: bytes, error=None):
        self.content = content
        self.error = error

    def raise_for_status(self):
        if self.error:
            raise self.error


@pytest.mark.unit
def test_fetch_feed_returns_decoded_content_and_sha256(monkeypatch):
    payload = b"Scheme Code;Scheme Name\\n"
    monkeypatch.setattr(amfi.requests, "get", lambda *args, **kwargs: FakeResponse(payload))

    content, digest = amfi.fetch_feed("https://amfi.example/nav.txt", timeout=7)

    assert content == payload.decode()
    assert digest == hashlib.sha256(payload).hexdigest()


@pytest.mark.unit
@pytest.mark.parametrize("error", [requests.Timeout("timed out"), requests.ConnectionError("offline"), requests.HTTPError("500")])
def test_fetch_feed_wraps_network_failures_as_amfi_error(monkeypatch, error):
    monkeypatch.setattr(amfi.requests, "get", lambda *args, **kwargs: FakeResponse(b"", error=error))

    with pytest.raises(AMFIError, match="AMFI request failed"):
        amfi.fetch_feed("https://amfi.example/nav.txt")


@pytest.mark.unit
@pytest.mark.parametrize("payload", [b"", b"<!doctype html><html><body>maintenance</body></html>"])
def test_fetch_feed_rejects_empty_or_html_responses(monkeypatch, payload):
    monkeypatch.setattr(amfi.requests, "get", lambda *args, **kwargs: FakeResponse(payload))

    with pytest.raises(AMFIError):
        amfi.fetch_feed("https://amfi.example/nav.txt")
