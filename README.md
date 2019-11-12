# CleanConnect
Janitorial coordination system

# install
1. clone this repo
2. required software
    1. Grab yourself a copy of nodejs and insomnia request manager
    2. run 'npm i' in the CleanConnect directory
    3. start mongodb and the node server using 'node server.js'
    4. You're all set, go on to the usage instructions
    
## Usage instructions
The api is seperated into 2 sections, these sections determine the proper input for each request:

### Models
* [Tag](/models/Tag.js)
* [User](/models/User.js)

### Routes
* [Tag](/routes/tag.js)
* [User](/routes/user.js)
    
## Views
Note to Justin, As you are building the mid-end(basically the nodejs part which stacks on the backend to serve the page content), I've created a views directory for you to work in. It contains a HTML file and CSS file which you can use to model your work off of. Additionally, I've provided you insomnia files in /reqs/ to model the interactions between your frontend and my backend API. Insomnia files are for unit testing the backend, and contain sample JSON requests that you may re-mix to submit your own data. You can import the insomnia data in /reqs/ into insomnia by clicking the dropdown in the purple insomnia logobox and selecting import/export.

### Authorization
For every server api path, in insomnia, you will have to create an account, using the create account tab(If you haven't already), then login using the login tab and copy the bearer key(the part that says bearer is included too, just copy the whole thing), and then move to your desired tab and go into its headers(in the menu right under the url bar, it's the tab called "Header"), and paste it into the box next to the row labeled "Authorization"

In production, most likely, we would store the bearer key in a cookie. The bearer key is only valid to the server for 24 hours, so the cookie should be set accordingly.

## Issue board
* maybe put "use strict"; at the top of some files temporarily to find some goofs
* if account is unverified for more than x days, delete it


### soon
* add email verification for both information change, delete user and signup -- use this npm mod for this: https://nodemailer.com/about/
* re-do comments to make code more legible

### future
* add email notifications of errors
* wireframe floorplans with color status

### Resolved (keep in mind when new code is written)
* add more swears to [comment validation](/validation/apr.js)
* make all errors this style:
	success: false,
	reason: "Post not found",
	moreDetailed: err
* add .catch with error logging to all promise functions with .catch((e)=>console.error(e));
* use uuid validate to check url based uuids for validity


### Resolved permanently
* possible migrate /print and /pdf to tags
* possible change to status codes

### Jake-specific:
/home/bluushift/Desktop/CleanConnect/backend/config,/home/bluushift/Desktop/CleanConnect/backend/models,/home/bluushift/Desktop/CleanConnect/backend/routes,/home/bluushift/Desktop/CleanConnect/backend/temp,/home/bluushift/Desktop/CleanConnect/backend/TESTING,/home/bluushift/Desktop/CleanConnect/backend/validation
