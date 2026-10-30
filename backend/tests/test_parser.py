from app.services.amfi import parse_feed

SAMPLE = """AMC
(Equity Scheme)
100001;INF000000001;INF000000002;Example Index Fund - Direct Plan - Growth Option;125.4200;29-Oct-2026
100002;INF000000003;INF000000004;Example Index Fund - Regular Plan - Growth Option;100.0000;29-Oct-2026
"""

def test_direct_growth_filter():
    funds, stats = parse_feed(SAMPLE)
    assert len(funds) == 1
    assert funds[0].scheme_code == 100001
    assert funds[0].category is None
    assert stats["rows_seen"] == 2
