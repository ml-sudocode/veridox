# veridox

Deployed at: https://veridox.herokuapp.com

##App Overview

###PROBLEM
Generally, information veracity and timing are hard to verify. Here, we are focused on the problem of information verification in the context of legal contracts.

More specifically, when legal contracts are created, sometimes the intention behind the language may be ambiguous, causing problems down the road when the parties disagree on implementation of the contract. Parties that bring their problem to court or to arbitration then engage in "he said, she said" debates, with information that is unverifiable. When no conclusion is reached, one or both sides are often subject to discovery processes that are costly for all parties - and may still not discover the relevant evidence due to fraudulent actions or poor archiving practices. Worse, documents presented at any time during the process may also be forged.

###USER JOURNEY
The central user persona is a party on either side of a contract.

Immediately after the contract is finalized, the user will be able to submit materials (emails and text messages) to the app, documenting the discussions conducted prior to contract finalization. Time-stamping at this time also proves that the information existed at the time of contract execution.

Down the road, in case of litigation or arbitration, the user will be able to submit the same materials to the judge/arbitrator, and include proof (provided by the app) that those materials were created prior to contract execution (the timing problem), and unchanged since (the information veracity problem).

###SOLUTION
In short: an app that can confirm that materials being submitted are veracious (unchanged) and existed at a said point in time.  

More detailed: When the materials are first submitted to the app, a hash of the documents is saved and timestamped, and this information is saved on a public blockchain.
Later, when materials are prepared for submission to court, the user will use the app to generate proof (implementation TBD) that that the materials were created prior to contract execution, and unchanged since.

This works like Accredible (certification verification), but for legal contracts: https://hackernoon.com/accredible-uses-tierion-for-blockchain-verifiable-credentials-633c82b6ec9d
