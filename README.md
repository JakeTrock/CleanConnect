# CleanConnect
Janitorial coordination system

# install
1. clone this repo
2. required software
    1. Grab yourself a copy of nodejs and insomnia request manager
    2. run 'npm i' in the CleanConnect directories
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
* add captcha to anonymous posting to prevent spam--justin
* add html/styling to email verification
* add webm/mp4/webp upload to image uploader--justin

### future
* add email notifications of errors
* pre-cache qrcode urls
* inventory system
* wireframe floorplans with color status
* add payment with [this](https://developers.braintreepayments.com/guides/payment-methods/node)

### Resolved (keep in mind when new code is written)
* re-do comments to make code more legible
* add more swears to [comment validation](/validation/apr.js)
* make all errors this style:
	success: false,
	reason: "Post not found",
	moreDetailed: err
* add .catch with error logging to all promise functions with .catch((e)=>console.error(e));


### Jake-specific:
/home/bluushift/Desktop/CleanConnect/backend/config,/home/bluushift/Desktop/CleanConnect/backend/models,/home/bluushift/Desktop/CleanConnect/backend/routes,/home/bluushift/Desktop/CleanConnect/backend/temp,/home/bluushift/Desktop/CleanConnect/backend/TESTING,/home/bluushift/Desktop/CleanConnect/backend/validation


### Justin-specific:

The email provider I am using dosne't actually send emails, it just intercepts them. To look at the intercepted emails go [here](https://ethereal.email/login)
and use these credentials:
* Username: lilian.bernhard@ethereal.email
* Password: fCc7CKMVv1VvuvrsaR


### setup ci
* https://codeforgeek.com/continuous-integration-deployment-jenkins-node-js/
* https://resources.github.com/whitepapers/practical-guide-to-CI-with-Jenkins-and-GitHub/
* https://developer.github.com/webhooks/
* https://github.com/hokuco/CleanConnect/settings/hooks
* Docker
    * Mail
        * https://mailu.io/1.7/setup.html
        * https://github.com/namshi/docker-smtp
    * Docker image setup
        * https://learndocker.online/
        * https://www.katacoda.com/courses/docker/
        * git run autodeploy to aws docker
        * build with closure: https://www.npmjs.com/package/google-closure-compiler
