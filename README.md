# Fetch_BE_Intern

# Description
Database that tracks users and the points in their accounts. Users only see a single balance in their accounts but we are also tracking the points per payer/partner. Each transaction record contains a payer, points and timestamp for each user. When a user spends their points there are two rules for determining which points to spend first: 
    - Want oldest timestamped points to be spent first
    - Want no payer's points to go negative

Web API will provide routes that add transactions for a specific payer and date. Spend points using the rules above and return a list of {"payer" : <string>, "points": <integer>} for each call and return all payer point balances. 

# Example 
Suppose you call your add transaction route with the following sequence of calls:
* { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
* { "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }
* { "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }
* { "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" }
* { "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }

Then you call your spend points route with the following request:
* { "points": 5000 }

The expected response from the spend call would be:
* [
    { "payer": "DANNON", "points": -100 },
    { "payer": "UNILEVER", "points": -200 },
    { "payer": "MILLER COORS", "points": -4,700 }
]