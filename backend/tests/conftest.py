from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def amfi_metadata_contract_feed() -> str:
    """Current-format AMFI sample with fund-house metadata and whitespace edge cases."""
    return (FIXTURES / "amfi_metadata_contract.txt").read_text(encoding="utf-8")
