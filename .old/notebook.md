# Log


Use this to make notes about what we do and when

### 02/02/2023

1. Upgrade to python3
2. Update path of dependencies
3. Update shell scripts
4. Add VCS

### 09/02/2023

1. Agree to refactor the application to Express.js and nonjucks (and sqlite for now).
We picked this stack because we wanted to learn javascript because of its popularity and nonjucks because it was easy to port from jinja.
2. 

### Endpoints and functionality we need to port to the new frameworks

Assume it is a get request unless something else is specifieds

| Endpoint                                       | Comment                                                                                                                                                                                |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Connect db                                     | Returns a new connection to the database.                                                                                                                                              |
| Init db                                        | Creates the database tables.                                                                                                                                                           |
| Query db                                       | Queries the database and returns a list of dictionaries.                                                                                                                               |
| Get user id                                    | Convenience method to look up the id for a username.                                                                                                                                   |
| Format datetime                                | Format a timestamp for display.                                                                                                                                                        |
| gravatar_url                                   | Return the gravatar image for the given email address.                                                                                                                                 |
| before_request                                 | Connect to db and lookup current user before each request                                                                                                                              |
| after_request                                  | Close db connection                                                                                                                                                                    |
| route ("/")                                    | Shows a users timeline or if no user is logged in it will redirect to the public timeline.  This timeline shows the user's     messages as well as all the messages of followed users. |
| route("/public")                               | Displays the latest messages of all users.                                                                                                                                             |
| route("/<username>")                           | Display's a users tweets.                                                                                                                                                              |
| route("/<username>/follow")                    | Adds the current user as follower of the given user.                                                                                                                                   |
| route("/<username>/unfollow")                  | Removes the current user as follower of the given user.                                                                                                                                |
| app.route("/add_message", methods=["POST"])    | Registers a new message for the user.                                                                                                                                                  |
| app.route("/login", methods=["GET", "POST"])   | Registers a new message for the user.                                                                                                                                                  |
| app.route("/login", methods=["GET", "POST"])   | Logs the user in.                                                                                                                                                                      |
| app.route("/register", methods=["GET","POST"]) | Registers the user.                                                                                                                                                                    |
| @app.route("/logout")                          | Logs the user out                                                                                                                                                                      |                                                                                                                                                                  