from app.repositories.memory import InMemoryFundRepository
from app.services.catalog import CatalogService

repository = InMemoryFundRepository()
catalog = CatalogService(repository)
