# -*- coding: utf-8 -*-
"""
    MiniTwit Tests
    ~~~~~~~~~~~~~~

    Tests a MiniTwit application.

    :refactored: (c) 2024 by HelgeCPH from Armin Ronacher's original unittest version
    :copyright: (c) 2010 by Armin Ronacher.
    :license: BSD, see LICENSE for more details.
"""
import requests
import json
import base64
import pytest
import os


# import schema
# import data
# otherwise use the database that you got previously

APP_URL = API_URL = "http://localhost"
APP_PORT = "3000"
API_PORT = "3001"
# APP_URL = "http://maxitwitapi"
# API_URL = "http://maxitwitapi"
DATABASE = "src/api/tmp/minitwit.db"
USERNAME = "simulator"
PWD = "super_safe!"
CREDENTIALS = ":".join([USERNAME, PWD]).encode("ascii")
ENCODED_CREDENTIALS = base64.b64encode(CREDENTIALS).decode()
HEADERS = {
    "Connection": "close",
    "Content-Type": "application/json",
    "Authorization": f"Basic {ENCODED_CREDENTIALS}",
}


def register(username, password, password2=None, email=None):
    """Helper function to register a user"""
    if password2 is None:
        password2 = password
    if email is None:
        email = username + "@example.com"
    return requests.post(
        f"{APP_URL}:{APP_PORT}/register",
        data={
            "username": username,
            "password": password,
            "password2": password2,
            "email": email,
        },
        allow_redirects=True,
    )


def login(username, password):
    """Helper function to login"""
    http_session = requests.Session()
    r = http_session.post(
        f"{APP_URL}:{APP_PORT}/login",
        data={"username": username, "password": password},
        allow_redirects=True,
    )
    return r, http_session


def register_and_login(username, password):
    """Registers and logs in in one go"""
    register(username, password)
    return login(username, password)


def logout(http_session):
    """Helper function to logout"""
    return http_session.get(f"{APP_URL}:{APP_PORT}/logout", allow_redirects=True)


def add_message(http_session, text):
    """Records a message"""
    r = http_session.post(
        f"{APP_URL}:{APP_PORT}/add_message", data={"text": text}, allow_redirects=True
    )
    if text:
        assert "Your message was recorded" in r.text
    return r


@pytest.fixture(scope="session", autouse=True)
def setup(request):
    if request.config.getoption("--force"):
        os.system("npx prisma migrate reset --skip-seed --force > /dev/null 2>&1")
    else:
        confirmation = input(
            "WARNING, this will erase the local database, are you sure you want to start? y/N "
        )
        if confirmation.lower() in ["y", "yes"]:
            os.system("npx prisma migrate reset --skip-seed --force > /dev/null 2>&1")
        else:
            pytest.exit("Tests cancelled by user.")

    if request.config.getoption("--container"):
        global APP_URL
        global API_URL
        APP_URL = "http://maxitwitserver"
        API_URL = "http://maxitwitapi"


# ---- API TESTS ----
def test_api_latest():
    # post something to updaet LATEST
    url = f"{API_URL}:{API_PORT}/register"
    data = {"username": "test", "email": "test@test", "pwd": "foo"}
    params = {"latest": 1337}
    response = requests.post(url, data=json.dumps(data), params=params, headers=HEADERS)
    assert response.ok

    # verify that latest was updated
    url = f"{API_URL}:{API_PORT}/latest"
    response = requests.get(url, headers=HEADERS)
    assert response.ok
    assert response.json()["latest"] == 1337


def test_api_register():
    username = "a"
    email = "a@a.a"
    pwd = "a"
    data = {"username": username, "email": email, "pwd": pwd}
    params = {"latest": 1}
    response = requests.post(
        f"{API_URL}:{API_PORT}/register",
        data=json.dumps(data),
        headers=HEADERS,
        params=params,
    )
    assert response.ok
    # TODO: add another assertion that it is really there

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 1


def test_api_create_msg():
    username = "a"
    data = {"content": "Blub!"}
    url = f"{API_URL}:{API_PORT}/msgs/{username}"
    params = {"latest": 2}
    response = requests.post(url, data=json.dumps(data), headers=HEADERS, params=params)
    assert response.ok

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 2


def test_api_get_latest_user_msgs():
    username = "a"

    query = {"no": 20, "latest": 3}
    url = f"{API_URL}:{API_PORT}/msgs/{username}"
    response = requests.get(url, headers=HEADERS, params=query)
    assert response.status_code == 200

    got_it_earlier = False
    for msg in response.json():
        if msg["content"] == "Blub!" and msg["user"] == username:
            got_it_earlier = True

    assert got_it_earlier

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 3


def test_api_get_latest_msgs():
    username = "a"
    query = {"no": 20, "latest": 4}
    url = f"{API_URL}:{API_PORT}/msgs"
    response = requests.get(url, headers=HEADERS, params=query)
    assert response.status_code == 200

    got_it_earlier = False
    for msg in response.json():
        if msg["content"] == "Blub!" and msg["user"] == username:
            got_it_earlier = True

    assert got_it_earlier

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 4


def test_api_register_b():
    username = "b"
    email = "b@b.b"
    pwd = "b"
    data = {"username": username, "email": email, "pwd": pwd}
    params = {"latest": 5}
    response = requests.post(
        f"{API_URL}:{API_PORT}/register",
        data=json.dumps(data),
        headers=HEADERS,
        params=params,
    )
    assert response.ok
    # TODO: add another assertion that it is really there

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 5


def test_api_register_c():
    username = "c"
    email = "c@c.c"
    pwd = "c"
    data = {"username": username, "email": email, "pwd": pwd}
    params = {"latest": 6}
    response = requests.post(
        f"{API_URL}:{API_PORT}/register",
        data=json.dumps(data),
        headers=HEADERS,
        params=params,
    )
    assert response.ok

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 6


def test_api_follow_user():
    username = "a"
    url = f"{API_URL}:{API_PORT}/fllws/{username}"
    data = {"follow": "b"}
    params = {"latest": 7}
    response = requests.post(url, data=json.dumps(data), headers=HEADERS, params=params)
    assert response.ok

    data = {"follow": "c"}
    params = {"latest": 8}
    response = requests.post(url, data=json.dumps(data), headers=HEADERS, params=params)
    assert response.ok

    query = {"no": 20, "latest": 9}
    response = requests.get(url, headers=HEADERS, params=query)
    assert response.ok

    json_data = response.json()
    assert "b" in json_data["follows"]
    assert "c" in json_data["follows"]

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 9


def test_api_a_unfollows_b():
    username = "a"
    url = f"{API_URL}:{API_PORT}/fllws/{username}"

    #  first send unfollow command
    data = {"unfollow": "b"}
    params = {"latest": 10}
    response = requests.post(url, data=json.dumps(data), headers=HEADERS, params=params)
    assert response.ok

    # then verify that b is no longer in follows list
    query = {"no": 20, "latest": 11}
    response = requests.get(url, params=query, headers=HEADERS)
    assert response.ok
    assert "b" not in response.json()["follows"]

    # verify that latest was updated
    response = requests.get(f"{API_URL}:{API_PORT}/latest", headers=HEADERS)
    assert response.json()["latest"] == 11


# ---- APP TESTS ----


def test_app_register():
    """Make sure registering works"""
    r = register("user1", "default")
    assert "You were successfully registered " "and can login now" in r.text
    r = register("user1", "default")
    assert "The username is already taken" in r.text
    r = register("", "default")
    assert "You have to enter a username" in r.text
    r = register("meh", "")
    assert "You have to enter a password" in r.text
    r = register("meh", "x", "y")
    assert "The two passwords do not match" in r.text
    r = register("meh", "foo", email="broken")
    assert "You have to enter a valid email address" in r.text


def test_app_login_logout():
    """Make sure logging in and logging out works"""
    r, http_session = register_and_login("user1", "default")
    assert "You were logged in" in r.text
    r = logout(http_session)
    assert "You were logged out" in r.text
    r, _ = login("user1", "wrongpassword")
    assert "Invalid password" in r.text
    r, _ = login("user2", "wrongpassword")
    assert "Invalid username" in r.text


def test_app_message_recording():
    """Check if adding messages works"""
    _, http_session = register_and_login("foo", "default")
    add_message(http_session, "test message 1")
    add_message(http_session, "<test message 2>")
    r = requests.get(f"{APP_URL}:{APP_PORT}/")
    assert "test message 1" in r.text
    assert "&lt;test message 2&gt;" in r.text


def test_app_timelines():
    """Make sure that timelines work"""
    _, http_session = register_and_login("foo", "default")
    add_message(http_session, "the message by foo")
    logout(http_session)
    _, http_session = register_and_login("bar", "default")
    add_message(http_session, "the message by bar")
    r = http_session.get(f"{APP_URL}:{APP_PORT}/public")
    assert "the message by foo" in r.text
    assert "the message by bar" in r.text

    # bar's timeline should just show bar's message
    r = http_session.get(f"{APP_URL}:{APP_PORT}/")
    assert "the message by foo" not in r.text
    assert "the message by bar" in r.text

    # now let's follow foo
    r = http_session.get(f"{APP_URL}:{APP_PORT}/foo/follow", allow_redirects=True)
    # Needed to modify &#34; to &quot;
    assert "You are now following &quot;foo&quot;" in r.text

    # we should now see foo's message
    r = http_session.get(f"{APP_URL}:{APP_PORT}/")
    assert "the message by foo" in r.text
    assert "the message by bar" in r.text

    # but on the user's page we only want the user's message
    r = http_session.get(f"{APP_URL}:{APP_PORT}/bar")
    assert "the message by foo" not in r.text
    assert "the message by bar" in r.text
    r = http_session.get(f"{APP_URL}:{APP_PORT}/foo")
    assert "the message by foo" in r.text
    assert "the message by bar" not in r.text

    # now unfollow and check if that worked
    r = http_session.get(f"{APP_URL}:{APP_PORT}/foo/unfollow", allow_redirects=True)
    # Needed to modify &#34; to &quot;
    assert "You are no longer following &quot;foo&quot;" in r.text
    r = http_session.get(f"{APP_URL}:{APP_PORT}/")
    assert "the message by foo" not in r.text
    assert "the message by bar" in r.text
