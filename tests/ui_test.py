import psycopg2
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options

GUI_URL = "http://localhost:3000/register"

# PostgreSQL connection settings
DB_HOST = "postgres"
DB_PORT = "5432"
DB_NAME = "testdb"
DB_USER = "pguser"
DB_PASSWORD = "pgpassword"

def _register_user_via_gui(driver, data):
    driver.get(GUI_URL)

    wait = WebDriverWait(driver, 5)
    buttons = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "actions")))
    input_fields = driver.find_elements(By.TAG_NAME, "input")

    for idx, str_content in enumerate(data):
        input_fields[idx].send_keys(str_content)
    input_fields[4].send_keys(Keys.RETURN)

    wait = WebDriverWait(driver, 5)
    flashes = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "flashes")))

    return flashes


def _get_user_by_name(conn, name):
    cur = conn.cursor()
    cur.execute("SELECT * FROM user WHERE 'username' = %s", (name,))
    user = cur.fetchone()
    cur.close()
    return user


def test_register_user_via_gui():
    firefox_options = Options()
    # firefox_options = None
    geckodriver_path = "/Users/christiannielsen/Library/CloudStorage/Dropbox/dev/repo/maxitwit/tests/geckodriver"

    firefox_options.add_argument("--headless")

    with webdriver.Firefox(service=Service(geckodriver_path), options=firefox_options) as driver:
        generated_msg = _register_user_via_gui(driver, ["Me", "me@some.where", "secure123", "secure123"])[0].text
        expected_msg = "You were successfully registered and can login now"
        assert generated_msg == expected_msg

    # cleanup, make test case idempotent
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    cur = conn.cursor()
    cur.execute("DELETE FROM user WHERE 'username' = %s", ("Me",))
    conn.commit()
    cur.close()
    conn.close()


def test_register_user_via_gui_and_check_db_entry():
    firefox_options = Options()
    # firefox_options = None
    firefox_options.add_argument("--headless")
    geckodriver_path = "/Users/christiannielsen/Library/CloudStorage/Dropbox/dev/repo/maxitwit/tests/geckodriver"

    with webdriver.Firefox(service=Service(geckodriver_path), options=firefox_options) as driver:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
        )
        assert _get_user_by_name(conn, "Me") is None

        generated_msg = _register_user_via_gui(driver, ["Me", "me@some.where", "secure123", "secure123"])[0].text
        expected_msg = "You were successfully registered and can login now"
        assert generated_msg == expected_msg

        user = _get_user_by_name(conn, "Me")
        assert user[1] == "Me"  # Assuming column order: id, username, email, pw_hash

        # cleanup, make test case idempotent
        cur = conn.cursor()
        cur.execute("DELETE FROM users WHERE username = %s", ("Me",))
        conn.commit()
        cur.close()
        conn.close()
