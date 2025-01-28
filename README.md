## About
EvacuAid is a web application that connects people during evacuations, enabling them to offer help by storing valuables, vehicles, pets, or housing others. It simplifies coordination, ensuring safety and support in emergencies.

## Instalation and Setup
To run this application, you will need to install Docker and Docker Compose on your computer. 

If you do not have docker already inbstalled, here is a link to install Docker Desktop: https://docs.docker.com/get-started/get-docker/

Since this web app uses OpenAI and Docusign's APIs, you'll also need to configure a few variables before youre able to run this server locally.

### OpenAI API Key setup:
1. If you dont already have one, make an OpenAI account and get an API Key. To get an OpenAI API Key, go to: https://openai.com/blog/openai-api/
2. Copy this API key and hold onto it for when we configure the keys for this app
 

### Docusign Integration Key setup:
1. If you dont already have one, make a Docusign developer account and go to: https://apps-d.docusign.com/admin/apps-and-keys.
2. When creating this integration key, you'll need to create an app and give it a name of your choice - in our example we used EvacuAid Community Relief.
3. Under the User Applicaiotn section, you'll select "No", "Single-Page Web Application", and "Implicit Grant"
4. Under the additional settings, you'll need to list the following Redirect URIs:
- http://localhost:3000/midsign
- http://localhost:3000/success
- http://localhost:3000/midsignhelper
- http://localhost:3000/detail
5. Under the CORS Configuration, you'll need to specify http://localhost as a Origin URL and select GET and POST fo rthe Allowed HTTP Methods.
6. Click save and then copy the Integration Key for this new app.

Once you have these two keys, you'll need to go into the root directory of this project and create a .env file. The contents of this file should look like this:
```
SECRET_KEY=[RANDOM CHARACHTERS OF YOUR CHOICE]
OPEN_AI_KEY=[YOUR OPENAI API KEY]
DOCUSIGN_INTEGRATION_KEY=[YOUR DOCUSIGN API KEY]
```

## Running
Once you've configured your API keys and gotten Docker installed, you should be able to run this server by running the following command from the root directory of this project:
```
docker-compose up
```
The server will take a couple minutes to start the first time. Once its running you should be able to access EvacuAid at http://localhost:3000/