from app.models import Fund


class InMemoryFundRepository:
    def __init__(self):
        self._funds: dict[int, Fund] = {}

    def replace_snapshot(self, funds: list[Fund]) -> None:
        self._funds = {fund.scheme_code: fund for fund in funds}

    def list_funds(self, query=None, category=None, beginner_tag=None, subcategory=None) -> list[Fund]:
        result = list(self._funds.values())
        if query:
            q = query.casefold()
            result = [f for f in result if q in f.scheme_name.casefold() or q in f.isin_growth.casefold() or q == str(f.scheme_code)]
        if category:
            if category.casefold() == "unclassified":
                result = [f for f in result if not f.category]
            else:
                result = [f for f in result if (f.category or "").casefold() == category.casefold()]
        if subcategory:
            result = [f for f in result if (f.subcategory or "").casefold() == subcategory.casefold()]
        if beginner_tag:
            result = [f for f in result if (f.beginner_tag or "").casefold() == beginner_tag.casefold()]
        return sorted(result, key=lambda f: f.scheme_name.casefold())

    def get_fund(self, scheme_code: int) -> Fund | None:
        return self._funds.get(scheme_code)
