from datetime import date
from decimal import Decimal

import pytest

from app.services.amfi import parse_feed


@pytest.mark.unit
@pytest.mark.contract
def test_maps_fund_house_name_to_each_scheme(amfi_metadata_contract_feed):
    funds, _stats = parse_feed(amfi_metadata_contract_feed)
    by_code = {fund.scheme_code: fund for fund in funds}

    assert by_code[100201].amc_name == "Acme Mutual Fund"


@pytest.mark.unit
@pytest.mark.contract
def test_sanitizes_scheme_name_and_preserves_all_fund_fields(amfi_metadata_contract_feed):
    funds, _stats = parse_feed(amfi_metadata_contract_feed)
    fund = next(item for item in funds if item.scheme_code == 100201)

    assert fund.model_dump() == {
        "scheme_code": 100201,
        "isin_growth": "INF000000201",
        "scheme_name": "Acme Large Cap Fund",
        "nav": Decimal("1234.5678"),
        "nav_date": date(2026, 10, 30),
        "plan": "direct",
        "option": "growth",
        "category": "Equity",
        "subcategory": "Large Cap Fund",
        "beginner_tag": None,
        "amc_name": "Acme Mutual Fund",
    }


@pytest.mark.unit
@pytest.mark.contract
def test_fund_house_context_changes_at_each_new_amc_header(amfi_metadata_contract_feed):
    funds, _stats = parse_feed(amfi_metadata_contract_feed)
    by_code = {fund.scheme_code: fund for fund in funds}

    assert by_code[100202].amc_name == "Beta Asset Management"
    assert by_code[100202].amc_name != by_code[100201].amc_name


@pytest.mark.unit
@pytest.mark.contract
def test_current_feed_rows_keep_decimal_nav_precision(amfi_metadata_contract_feed):
    funds, _stats = parse_feed(amfi_metadata_contract_feed)
    by_code = {fund.scheme_code: fund for fund in funds}

    assert by_code[100201].nav == Decimal("1234.5678")
    assert by_code[100202].nav == Decimal("12.3400")
