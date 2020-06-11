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

## Issue board (both)
* https://github.com/codemix/fast.js/tree/master
* new slogan needed for qr stickers

## Issue board (Jake)
* Potentially replace blobs with images

## Notes to Jake from Justin
* Going to need list of payment costs and what they'll give you even if temporary
    * Corporate/chain plan (2)
        * This plan is for large businesses, and allows users to create up to 100 tags with unlimited usage
    * Business plan (1)
        * This plan is for medium businesses and complexes, and allows users to create up to 10 tags with unlimited usage. This plan is perfect for offices, condo complexes and gyms.
    * Small business plan (0)
        * This plan is for small businesses, and allows users one tag for all reporting. This tag is re-usable, but location of reports is harder to discern.


## Issue board (Justin)
* Replace try/catch blocks eventually
* Implement environment variables to hide private info (server address too?)
* Clean up code with comments, potentially cleaning up css files
* Add text to main page describing project, as well as creating contact page
* Add more routes for pages such as print?
* here are some instructions to fix your application after my new push changes take hold(these changes are also in the insomniafile):
    * all comment routes will now change to be more descriptive, and have better structure
        * new comment is /comment/new/:id
        * delete comment is /comment/delete/:id1/:id2
        * restore comment is /comment/restore/:id/:comment_id
    * all tag routes will change to be more descriptive as well
        * restore route is /tag/restore/id
        * delete route changed to /tag/delete/id
    * p.s. all fields in the url that have a : before them are url variables


### future
* use this for pdf in future? https://github.com/kazuhikoarase/sticker-works
* inventory system
* wireframe floorplans with color status

### Bizdev
* Ask about payment system(how much each tag tier should cost)
    * Couldn't answer
* financial handling(cost splitting, taxes)
    * Email him, mainly handled by finance lawyers, papers cost ~$60 to be filled by a pro 
* User agreements(which one to use)
    * Email him, boilerplate should work for now
* Patent/Copyright
    * Copyright papers are ~$90 to file
    * Patents can be searched without cruddy mainframes at https://www.google.com/?tbm=pts