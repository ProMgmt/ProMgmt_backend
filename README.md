# ProMgmt [![Build Status](https://travis-ci.org/ProMgmt/ProMgmt_backend.svg?branch=master)](https://travis-ci.org/ProMgmt/ProMgmt_backend) [![Coverage Status](https://coveralls.io/repos/github/ProMgmt/ProMgmt_backend/badge.svg?branch=staging)](https://coveralls.io/github/ProMgmt/ProMgmt_backend?branch=staging)

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

### Site Map
<h1 align="center">
  <img src="https://s3-us-west-2.amazonaws.com/cfgramdev/ProMgmt+Site+Map.png" height="750" width="auto"></a>
</h1>

### Resource Relationships
<h1 align="center">
  <img src="https://s3-us-west-2.amazonaws.com/cfgramdev/Project+Management+App+ERD.png" height="750" width="auto"></a>
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


#### ```DELETE /api/user/<userId>```

If you hit this route with a valid userId, it will delete the resource from the database, and return a 204 status.

## Profile

#### ```POST /api/profile```
Upon signup, you can make a profile for your user. To create a profile, the following JSON object is needed:
```
{
  "firstName": "<users first name>",
  "lastName": "<users last name>",
  "desc": "<brief personal description>",
  "title": "<ones title within their company>",
  "company": "<company name>"
}
```

#### ```GET /api/profile/<profileId>```

#### ```PUT /api/profile/<profileId>```

#### ```DELETE /api/profile/<profileId>```

## Profile Picture

#### ```POST /api/profile/:profileId/pic```
As you make a profile, you'll be able to upload a profile picture if you wish. The photo will be uploaded to Amazon Web Services S3. 

The route requires a filepath. Upon completion, you'll revieve the following:
```
{
  "userId": "<user id>",
  "profileId": "<profile id>",
  "avatarURI": "<URL of photo>",
  "avatarObjectKey": ""<AWS Object Key>",
}
```


#### ```GET /api/profile/<profileId>```

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

You can look up Organizations by Id using this route. OrgId is a required parameter.

Upon success, you will recieve the following:
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


#### ```PUT /api/org/<orgId>```

Organizations can be updated at this route. OrgId is a required parameter, as well as an object containing at least one of the following key:value pairs.
```
{
  "name": "<organizationName>",
  "desc": "<brief overview of organization>",
}
```

Upon success, you will recieve the following:
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

#### ```DELETE /api/org/<orgId>```

You can delete organizations through this route. You will need an OrgId in the parameters, and upon successful deletion, you will receive a 204 status.  

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

The _id of the project will also be added to the array of projects in the associated org resource.

#### ```GET /api/project/<projectId>```

#### ```PUT /api/project/<projectId>```

#### ```DELETE /api/project/<projectId>```

## Task

#### ```POST /api/project/<projectId>/task```

You can add tasks to a specific project at this route. Project ID is a required parameter, and the request body should contain the following:
```
{
  "desc": "<task description>",
  "startDate": "<updated start date>",
  "endDate": "<updated end date>",
  "expectedDuration": "<updated expected duration>",
  "actualDuration": "<updated actual duration>",
  "status": "<updated status>",
  "isDependency": "<true/false>"
}
```

Upon success, you will recieve the following:
```
{
    "_id": "5aa9938031e7c464df9e1f7a",
    "admins": ["<array of userIds with admin rights>"],
    "dependentTasks": [<array of taskIds that are dependent on this one>],
    "desc": "<task description>",
    "orgId": "<orgId of parent organization>",
    "projectId": "<projectId>",
    "subTasks": [<array of child tasks>],
    "startDate": "<updated start date>",
    "endDate": "<updated end date>",
    "expectedDuration": "<updated expected duration>",
    "actualDuration": "<updated actual duration>",
    "status": "<updated status>",
    "isDependency": "<true/false>"
}
```

#### ```GET /api/task/<taskId>```

You can look up tasks by taskId through this route. TaskId is a required parameter

Upon success, you will recieve the following:
```
{
    "_id": "5aa9938031e7c464df9e1f7a",
    "admins": ["<array of userIds with admin rights>"],
    "dependentTasks": [<array of taskIds that are dependent on this one>],
    "desc": "<task description>",
    "orgId": "<orgId of parent organization>",
    "projectId": "<projectId>",
    "subTasks": [<array of child tasks>],
    "startDate": "<updated start date>",
    "endDate": "<updated end date>",
    "expectedDuration": "<updated expected duration>",
    "actualDuration": "<updated actual duration>",
    "status": "<updated status>",
    "isDependency": "<true/false>"
}
```

#### ```PUT /api/task/<taskId>```

You can update tasks by taskId through this route. TaskId is a required parameter as well as an object containing key:value pairs containing requested changes:

request body:
```
  {
    "admins": ["update list of admins"],
    "dependentTasks": ["updated list of dependent tasks"],
    "subTasks": ["updated list of sub tasks"],
    "desc": "<updated description>",
    "startDate": "<updated start date>",
    "endDate": "<updated end date>",
    "expectedDuration": "<updated expected duration>",
    "actualDuration": "<updated actual duration>",
    "status": "<updated status>",
    "isDependency": "<true/false>"
  }
```


Upon success, you will recieve the following:
```
{
    "_id": "5aa9938031e7c464df9e1f7a",
    "admins": ["<array of userIds with admin rights>"],
    "dependentTasks": [<array of taskIds that are dependent on this one>],
    "desc": "<task description>",
    "orgId": "<orgId of parent organization>",
    "projectId": "<projectId>",
    "subTasks": [<array of child tasks>],
    "startDate": "<updated start date>",
    "endDate": "<updated end date>",
    "expectedDuration": "<updated expected duration>",
    "actualDuration": "<updated actual duration>",
    "status": "<updated status>",
    "isDependency": "<true/false>"
}
```

#### ```DELETE /api/task/<taskId>```

You can delete tasks and their associated relationships through this route.  TaskId is a required parameter.  Upon success you will receive a 204 status code.

## Attachment

#### ```POST /api/task/<taskId>/attach```

You can add attachments to specific tasks through this route.  The attachment will be uploaded to Amazon Web Services S3 and the database will retain information necessary to access the attachment.

The route requires a task ID request parameter and a body containing:
```
{
  "name": "<name of the attachment>",
  "type": "<type of attachment>",
  "attach": "<directory location of attachment file>"
}
```

Upon success, you will receive the following:
```
{
  "name": "<name of attachment>",
  "taskId": "<id of related task>",
  "projectId": "<id of project inherited from related task>",
  "orgId": "<id of org inherited from project inherited from related task>",
  "admins": ["<array of users with admin privledges on this attachment>"],
  "type": "<type of attachment>",
  "attURI": "<URL of attachment>",
  "objectKey": "<AWS Object Key>",
  "created": "<date created>"
}
```

#### ```GET /api/attach/<attachId>```

You can get the mongoDB object representing the attachment associated with the attach ID.  Attach ID is a required parameter for this route.

Upon success, you will receive the following:
```
{
  "name": "<name of attachment>",
  "taskId": "<id of related task>",
  "projectId": "<id of project inherited from related task>",
  "orgId": "<id of org inherited from project inherited from related task>",
  "admins": ["<array of users with admin privledges on this attachment>"],
  "type": "<type of attachment>",
  "attURI": "<URL of attachment>",
  "objectKey": "<AWS Object Key>",
  "created": "<date created>"
}
```

#### ```DELETE /api/attach/<attachId>```

You can delete the attachment associated with the attach ID from mongo DB and AWS S3 through this route.  Attach ID is a required parameter for this route.  Upon success you will receive a 204 status code.

# Contributors 

- Nicole Weese
- Katy Robinson
- David Kosmos 
- Taylor Stemple










