# ![](public/img/logo.png) VERIDOC

Deployed at: https://veridox.herokuapp.com

__Note: This Readme is focused on (1) the business case, and (2) reflections on the execution of the project.__
__For a how-to of the app, please go to the deployed site, which provides a straightforward explanation of features and the how-to.__

## App Overview

This app was inspired by my time in private equity, where legal enforcement of contracts turned out much messier and more expensive than I believe they needed to be.

Veridox is a blockchain-based solution to the problem.

### PROBLEM
Generally, information veracity and timing are hard to verify. Here, we are focused on the problem of information verification in the context of legal contracts.

More specifically, when legal contracts are created, sometimes the intention behind the language may be ambiguous, causing problems down the road when the parties disagree on implementation of the contract. Parties that bring their problem to court or to arbitration then engage in "he said, she said" debates, with information that is unverifiable.

When no conclusion is reached, one or both sides are often subject to discovery processes that are costly for all parties - and may still not discover the relevant evidence due to fraudulent actions or poor archiving practices. Worse, documents presented at any time during the process may also be forged.

### SOLUTION
In short: an app that can confirm that materials being submitted are veracious (unchanged) and existed at a said point in time. The app utilizes the Bitcoin blockchain to anchor information immutably.

When data is first submitted to the app, a hash of the documents is saved and timestamped, and this information is saved on a publicly accessible blockchain.

Later, when materials are prepared for submission to court, the user will use the app to generate proof that that the materials were created prior to contract execution, and unchanged since.

(This works like Accredible (certification verification), but for legal contracts: https://hackernoon.com/accredible-uses-tierion-for-blockchain-verifiable-credentials-633c82b6ec9d)

### USER JOURNEY
The central user persona is a party on either side of a contract.

Immediately after the contract is finalized, the user will be able to submit materials (emails and text messages) to the app, documenting the discussions conducted prior to contract finalization. Time-stamping at this time also proves that the information existed at the time of contract execution.

Down the road, in case of litigation or arbitration, the user will be able to submit the same materials to the judge/arbitrator, and include proof (a receipt of information anchored to the Bitcoin blockchain) that those materials were created prior to contract execution (the timing problem), and unchanged since (the information veracity problem).

### CAVEATS
* Commercially, legal counter-parties often want to leave some room for interpretation, so that when (if) enforcement occurs in the future, they can incorporate situational factors in making their arguments. This app essentially takes much of that grey area off the table
* On the flip side, data taken out of context may also lead to unintended, negative outcomes. One mitigation against this would be to modify the app so that counter-parties have to jointly submit one set of data
* In addition, the potential that communications may be codified and held against yourself years down the road may result in individuals and companies being reluctant to put only the most innocuous communications in writing, rendering this solution pointless

## ![](public/img/logo_tierion.png)
The core technology used in this app is Tierion: https://tierion.com.

It is a service that anchors data to the Bitcoin blockchain, providing a receipt with information that can be verified on the blockchain, e.g. the Merkle Root that the data was anchored to. They have partnered with big corporates like Philips and Microsoft.

Use cases include:
- Immutable Records
Medical records, financial records, corporate governance, legal records, inventory management.
A popular example is land registries in areas where the legal and administrative infrastructure are weak and vulnerable to corruption.

- Secure Customer Data
Create a verifiable record of customer data. Reduce KYC and compliance costs.
This is another often touted application of the blockchain, as KYC does not have to be duplicated for the same customer whenever he/she requires a new service.

- IoT Data Collection
Capture data from various connected devices. Every record gets a proof.
This is a popular topic in the contemporary conversation on security vulnerabilities in IoT e.g. video cameras and fridges.

- Audit Trail
Create a cryptographically verifiable audit trail. Track data provenance and processes.

## Entity Relationship Diagram

## Reflections
### Doing a blockchain-related app was a white space project
As a result, instead of defining the end result from the start, my process involved a significant amount of time exploring how to apply different technologies.
- Lisk: a Node.js based decentralized application ("Dapp") blockchain company.
Website: https://lisk.io/
I spent a day figuring out how I could interact with their product. I ended up successfully setting up a testnet node on a virtual machine (http://45.32.120.37:7000/), but that's the extent of what I can do with it now. Their software development kit is not yet available to build Dapps
- Tierion: a service that anchors data to the Bitcoin blockchain.
It has 2 fully functioning APIs, each used in different use cases. I had to spend equal amounts of time understanding how i could / would use each, to decide which would work best.
While first API (the HashAPI) required me to hash data myself, it was easier to implement overall, and it had a Node library to make interacting with the HashAPI even easier. However it did not include all the information I needed, in the format I needed it, to make the use case meaningful e.g. timestamp the receipt.
So, in the end, I used the fuller API, the DataAPI.
___Being able to navigate to a block explorer to view the Bitcoin block where my data lived was cool!___
- Opentimestamps. A web-based timeproofing service
Website: https://opentimestamps.org/
I explored this as a fallback solution in case I could not successfully work with the Tierion API which is a lot more complex. Unfortunately, I found the OpenTimestamps UI too confusing to use.

### Async mayhem
- The Tierion API had to be called at multiple points through the User Journey
- In addition, each new entry by the user populates three separate collections, at a time when all the required data may not yet be available (e.g. when the current blockchain block is still being mined/confirmed)
- This resulted in a lot of headache, and ultimately a lot of learning gains (yay), in order to manage the numerous async operations

### Transition from form submit to AJAX page update (without exposing API keys)
- This is my first implementation of live page updates without page refresh (aka AJAX), while still running XMLHttpRequest, with its sensitive API keys, in the server
- On the page displaying a full entry, the blockchain receipt data is not always available until about 2-8 minutes later
- The most straightforward implementation to check if the receipt is available would be to load the XMLHttpRequest (the Tierion API call) on the script.js file loaded in the browser. However that would expose my Tierion API keys
- The next most straightforward implementation would be via a form submit, sending a request to the server to check if the receipt is ready (without exposing my API keys). But this involves re-rendering the page, which I didn't want to do as it is operationally expensive and inefficient. At first, I settled for a form submit, and instead of re-rendering the entry page, I sent the JSON result to the browser (res.json(receiptData))
- However, through world-class pigheadedness and some mentorship (thanks Prima!), I figured out a solution: (a) use jQuery .click event on the front end to trigger a JSON AJAX ($.getJSON) call to an API endpoint (essentially just a defined route); (b) call the Tierion API to check on the receipt status; and then (c) return data to the $.getJSON function to render the new information on the page... all without a page refresh.
- Other than understanding $.getJSON (a shorthand of the $.ajax I am familiar with), another tricky part of the third implementation was how to pass the entryId variable from the front end, to the back end. For this, i utilized a few operations I wasn't familiar with:
  * script.js:
  This was used to grab the entryId in the URL of the current page:
  ```var currentUrl = $(location).attr('pathname')
  ```
  The below adds query parameters to the URL path: /user/receipt.json?entryId=23u8912y31i2u21u231
  ```$.getJSON("/user/receipt.json", {
    "entryId": entryId
  }, function (res) {...})
  ```

  * userController.js:
  This was used to grab the path that led to this function, i.e. /user/receipt.json?entryId=23u8912y31i2u21u231
  ```var originalUrl = req.originalUrl
  ```
  Then, using regex, i grabbed the entryId, and proceeded to call the Tierion API

### Full CRUD
- Full Create, Read, Update and Delete capabilities for Entries. Neither of my previous 2 projects had full CRUD, so I'm happy with the progress

## Areas for Improvement
Functionality
- Upload documents rather than plaintext (e.g. email files, txt files exported from Whatsapp)
- Users can send an invite to external parties to verify that the data was anchored to the blockchain at a stated date
- Counter-parties can jointly submit data so that there is no dispute over the content being submitted
- Normalization of user input to avoid formatting issues resulting in different hash results for essentially the same content
- Search function across all Entries
- Contract Date field for Entries. Deprioritized due to format normalization hurdle

Security
- Escape from form inputs

Code Design
- DRY-er code. Currently API requests include duplicated code and/or parameters
- Greater orthogonality. Currently some functions do several things, though there is an effort to implement Single Responsibility principle
- Debugging process

Tech Operations
- Unit tests (e.g. Mocha/Chai)
- Functional tests (e.g. Selenium)
- System integration test (e.g. Travis CI)

Process
- More detailed Use Case diagram earlier on, to streamline development

## Good Calls
___aka decisions that turned out well___
- Choosing to use a non-relational database like MongoDB, rather than a relational database like Postgresql. Given the complexity and uncertainty involved in this project, I frequently updated my schema to optimize functions or to work around limitations (e.g. avoid multiple nested database queries). If used a relational DB, requiring a migration each time
- Re-using the Passport implementation from a previous project for authentication saved a lot of time early on >> reusable code FTW

## Observations
### Ruby on Rails vs ExpressJS
- I had originally wanted to build a Rails app, but because the Tierion documentation focused on Javascript, and one of the 2 APIs had a Node.js library, so I went with Express (eventually I didn't use the library, so I could have gone with Rails instead)
- Early on I started missing the conventions in Rails that made life easier. For example, having to define routes one by one was less efficient
- Being able to set data-remote=true on forms in Ruby also makes Ajax fired in the client but processed in the browser easier to handle than in ExpressJS (see Reflections section on the roundabout solution I implemented)
- That being said, a non-opinionated framework can be more flexible, and provides more reinforcement of fundamentals than an opinionated, conventions-driven framework like Rails

### Blockchain companies
- Having spent a good proportion of my time learning the tech behind three different blockchain products, here is a  summary of my takeaways
- Lisk was the most abstracted from the blockchain. When their SDK becomes available, I understand that you would build apps ("Dapps") the same way you would normally build Node.js apps, except they would run on or alongside the Lisk blockchain (I still have more learning to do here)
- OpenTimetamps was IMO the least abstracted from the blockchain. You enter some input, their very basic web-based app returns a file, and you submit this file back later to prove that your data existed at a said point in time. However, it wasn't very clear what I had to do (of course perhaps that's related to my technical chops not being up to scratch yet)
- Tierion was the Goldilocks of the bunch, with clean and easy to use APIs to submit your data to the blockchain. They provide a good web-based UI to verify your record, which is how I have chosen to implement verification in my app (instead of using their API within the Veridox app)
- While building a blockchain technology or company is not trivial, I've come to understand that the application of blockchain technology can actually be relatively straightforward. This gives the blockchain revolution the true potential to disrupt industries and relationships that currently rely on trust central authorities to function

## Built With
* [NodeJS](https://nodejs.org) - JS runtime environment / network application platform
* [ExpressJS](https://expressjs.com) - Web App Framework
* [MongoDB](https://www.mongodb.com) - Database
* [Heroku](https://dashboard.heroku.com/) - Deployment
* [Tierion](https://tierion.io) - Core API, blockchain technology
* [Bulma](https://bulma.io) - CSS Module

__Contact: michelle.y.lai |at| gmail.com_
