from app.services.amfi import parse_feed

LEGACY_SAMPLE = """AMC
(Equity Scheme)
100001;INF000000001;INF000000002;Example Index Fund - Direct Plan - Growth Option;125.4200;29-Oct-2026
100002;INF000000003;INF000000004;Example Index Fund - Regular Plan - Growth Option;100.0000;29-Oct-2026
"""

CURRENT_SAMPLE = """Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date
Open Ended Schemes(Equity Scheme - Large Cap Fund)
Example Mutual Fund
100101;INF000000101;-;Example Large Cap Fund;Direct Plan;Growth Option;25.4200;30-Oct-2026
100102;INF000000102;-;Example Large Cap Fund;Regular Plan;Growth Option;24.1000;30-Oct-2026
Open Ended Schemes(Debt Scheme - Liquid Fund)
Example Mutual Fund
100103;INF000000103;-;Example Liquid Fund;Direct Plan;Growth Option;12.5000;30-Oct-2026
Open Ended Schemes(Hybrid Scheme - Aggressive Hybrid Fund)
Example Mutual Fund
100104;INF000000105;-;Example Hybrid Fund;Direct Plan;Growth;18.7500;30-Oct-2026
Open Ended Schemes(Life Cycle Funds - Life Cycle Fund with Maturity of 10 Years)
Example Mutual Fund
100105;INF000000106;-;Example Life Cycle Fund;Direct Plan;Growth;10.0000;30-Oct-2026
Open Ended Schemes(Other Scheme - FoF Domestic)
Example Mutual Fund
100106;INF000000107;-;Example Fund of Funds;Direct Plan;Growth;11.0000;30-Oct-2026
Open Ended Schemes(Children’s Fund - Childrens' Fund)
Example Mutual Fund
100107;INF000000108;-;Example Children's Fund;Direct Plan;Growth;12.0000;30-Oct-2026
"""


def test_direct_growth_filter_legacy_format():
    funds, stats = parse_feed(LEGACY_SAMPLE)
    assert len(funds) == 1
    assert funds[0].scheme_code == 100001
    assert funds[0].category is None
    assert funds[0].subcategory is None
    assert stats["rows_seen"] == 2


def test_current_amfi_category_headers_and_plan_filter():
    funds, stats = parse_feed(CURRENT_SAMPLE)
    by_code = {fund.scheme_code: fund for fund in funds}
    assert set(by_code) == {100101, 100103, 100104, 100105, 100106, 100107}
    assert (by_code[100101].category, by_code[100101].subcategory) == ("Equity", "Large Cap Fund")
    assert (by_code[100103].category, by_code[100103].subcategory) == ("Debt", "Liquid Fund")
    assert by_code[100104].category == "Hybrid"
    assert by_code[100105].category == "Life Cycle"
    assert by_code[100106].category == "Other"
    assert by_code[100107].category is None
    assert by_code[100107].subcategory is None
    assert stats["rows_seen"] == 7
