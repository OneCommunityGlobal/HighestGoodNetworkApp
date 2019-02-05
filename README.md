##HGN TIME Tracking Application in React##


'npm install' to install the dependencies.
'npm start' to run the application

To get started, make sure you have:

1. Node v9.5 or higher installed on your machine.
2. A decent code editor like VS Code or Atom.
3. Git

Step1: Clone the App
To clone the code, navigate to the source directory where you want to maintain the code and via terminal or GUI of your choice, run : git clone https://github.com/OneCommunityGlobal/HighestGoodNetworkApp.git . You can also setup SSH and then use that for working with remote. 

Step2: Run npm install.
Best way is to open the code in the editor and open integrated teminal. Run npm install.

Step3: Start the app:
To start the app, you need to set up the api endpoint as a process.env variable. You can just run
REACT_APP_APIENDPOINT=<put apiendpoint here> npm start
You may have to run it as super user (i.e. sudo) depending upon the permission setup on your machine.
The application, by default, starts on port 3000. If 3000 is busy, then the start process will suggest another port and you can choose that. The url, by default, will be http://localhost:3000. You will need to login and those credentials will be provided to you as a part of your user setup process.

Note:
Once you check in the code in github, the application will be publsihed to following:
  - All branches except master : https://hgnapplication_react_dev.surge.sh
  - Master: https://hgnapplicationv2.surge.sh

Other key touchpoints:
1. Build: CircleCI
2. Monitoring and logging: Sentry.io
