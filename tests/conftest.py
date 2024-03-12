def pytest_addoption(parser):
    parser.addoption(
        "--force", action="store_true", default=False, help="Skip warning question"
    )
    parser.addoption(
        "--container",
        action="store_true",
        default=False,
        help="Run tests in a container",
    )
