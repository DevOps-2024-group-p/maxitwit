### Dev setup:

#### Locally

- **Install Dependencies:** 
npm install

- **Start the Server:** 
DEBUG=neotwit:* npm start

- **Stop the Server:** 
DEBUG=neotwit:* npm stop

- **Alternative Way to Start the Server + Watch for Changes:** 
npx nodemon

#### Containerized

- **Build Image:**

docker build -t maxitwit/app .

- **Run Container:**

docker run -it -dp 3000:3000 maxitwit/app

- **Alternatively use docker compose:**

docker compose up
