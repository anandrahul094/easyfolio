from app.services.amfi import parse_feed

LEGACY_SAMPLE = """AMC
(Equity Scheme)
100001;INF000000001;INF000000002;Example Index Fund - Direct Plan - Growth Option;125.4200;29-Oct-2026
100002;INF000000003;INF000000004;Example Index Fund - Regular Plan - Growth Option;100.0000;29-Oct-2026
"""

CURRENT_SAMPLE = """Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date
Example Mutual Fund
100101;INF000000101;-;Example Nifty 50 Index Fund;Direct Plan;Growth Option;25.4200;30-Oct-2026
100102;INF000000102;-;Example Nifty 50 Index Fund;Regular Plan;Growth Option;24.1000;30-Oct-2026
100103;INF000000103;INF000000104;Example Nifty 50 Index Fund;Direct Plan;IDCW Option;12.5000;30-Oct-2026
100104;INF000000105;-;Example Nifty Next 50 Index Fund;Direct Plan;Growth;18.7500;30-Oct-2026
"""


def test_direct_growth_filter_legacy_format():
    funds, stats = parse_feed(LEGACY_SAMPLE)
    assert len(funds) == 1
    assert funds[0].scheme_code == 100001
    assert funds[0].category is None
    assert stats["rows_seen"] == 2


def test_direct_growth_filter_current_amfi_format():
    funds, stats = parse_feed(CURRENT_SAMPLE)
    assert {fund.scheme_code for fund in funds} == {100101, 100104}
    assert stats["rows_seen"] == 4
    assert funds[0].scheme_name == "Example Nifty 50 Index Fund"
