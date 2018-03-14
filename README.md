# ProMgmt [![Build Status](https://travis-ci.org/ProMgmt/ProMgmt_backend.svg?branch=master)](https://travis-ci.org/ProMgmt/ProMgmt_backend) [![Coverage Status](https://coveralls.io/repos/github/ProMgmt/ProMgmt_backend/badge.svg?branch=master)](https://coveralls.io/github/ProMgmt/ProMgmt_backend?branch=master)

ProMgmt is project management software that helps comapanies, organizations, and teams to define, organize, and manage projects.

Users can create a profile, start and join orgainizations, create projects, and create and assign tasks within those projects to other users. 

### Dependencies and Technologies

- node.js
  - aws-sdk
  - bcrypt
  - body-parser
  - cors
  - debug 
  - dotenv
  - express
  - http-errors
  - jsonwebtoken
  - mongoose
  - morgan
  - multer
  - faker
- Travis CI
- MongoDB

### Download and Testing

To download and run the code, git clone our repo:
```<https://github.com/ProMgmt/ProMgmt_backend.git>```

Download needed dependencies with ```npm i``` and run the test suites with ```npm run test```.

### Resource Relationships
<h1 align="center">
  <img src="https://s3-us-west-2.amazonaws.com/cfgramdev/Project+Management+App+ERD.png" height="700" width="auto"></a>
</h1>

# Routes

## User

#### ```POST /api/signup```

To sign up, you can hit this route. You will need to send a JSON object containing the following:
```
{
  'username': '<username>',
  'email': '<email>',
  'password': '<password>',
}
```
Upon success, you will recieve a JSON webtoken:
```
{
  token: <token>,
}
```

#### ```GET /api/signin```

Once you have a have an account, you can hit this route with proper basic Auth, and you will recieve your token.
```
{
  token: <token>,
}
```


#### ```PUT /api/user/<userId>```

#### ```DELETE /api/user/<userId>```

## Profile

#### ```POST /api/profile```

#### ```GET /api/profile/<profileId>```

#### ```PUT /api/profile/<profileId>```

#### ```DELETE /api/profile/<profileId>```

## Organization

#### ```POST /api/org```

You can create new organizations at this route, and will need to send a JSON object containing the following:
```
{
  "name": "<organizationName>",
  "desc": "<brief overview of organization>",
}
```
If successful, the user that created the organization will be made the admin for the organization, granting them rights to add/remove users, add/remove projects, and give others admin rights. You will receive a JSON object back with the following key/values:
```
{
    "_id": "<organizationId>",
    "admins": [<array of users with admin rights>],
    "desc": "<description>",
    "name": "<organizationName>",
    "projects": [<array of projects owned by organization>],
    "users": [<array of users belonging to organization>],
}
```
#### ```GET /api/org/<ordId>```

#### ```PUT /api/org/<orgId>```

#### ```DELETE /api/org/<orgId>```

## Project

#### ```POST /api/org/<orgId>/project```

You can create a new project for your organization at this route. You'll need to send a JSON object witht he following key/value pairs:
```
{
  "projectName": "<name of the project>",
  "desc": "<description of the project>",
}
```
Upon success, the user that created the project will be given admin rights, and you should recieve the following:
```
{
   "_id": "<projectId>",
    "admins": ["<array of users with admin rights>"],
    "desc": "<project description>",
    "orgId": "<organizationId>",
    "projectName": "<name of project>",
    "tasks": [<array of tasks that belong to project>],
    "users": [<array of users that belong to project>],
}
```

#### ```GET /api/project/<projectId>```

#### ```PUT /api/project/<projectId>```

#### ```DELETE /api/project/<projectId>```

## Task

#### ```POST /api/project/<projectId>/task```



#### ```GET /api/task/<taskId>```

#### ```PUT /api/task/<taskId>```

#### ```DELETE /api/task/<tskId>```











