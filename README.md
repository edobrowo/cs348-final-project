# CS 348 Group Project
For more info, check final report.pdf
## Setup
The latter sections of the README provide an explanation on how to set up the database application.
## Sample and Production datasets
We provide a set of unit tests performed on the implemented database queries. The tests are run whenever `npm run resetdb` is invoked. They can also be manually run inside the `backend` directory by executing the command `npm run testdb`.
### Sample Data
To load and test the database with **sample data**, in the file `backend/.env`, change the value of `ENVIRONMENT=` to `ENVIRONMENT=sample`. Then run `npm run resetdb` and `npm run testdb`. The expected output of `npm run testdb` for `ENVIRONMENT=sample` can be found in `/test-sample.out`.
### Production Data
To load and test the database with **production data**, in the file `backend/.env`, change the value of `ENVIRONMENT=` to `ENVIRONMENT=production`. Then *re-run* `npm run resetdb` and `npm run testdb` to reset the database and run the tests again. The expected output of `npm run testdb` for `ENVIRONMENT=production` can be found in `/test-production.out`.

## Feature support
Requests are sent through the backend. HTTP requests are routed via `backend/src/routes/routes.js`, and handled in `backend/src/controllers/controller.js`. The controllers then call the according model functions in `backend/src/models` that then communicate with the database to retrieve the requested data.
For now, the web UI should be run with the *sample dataset*. Frontend files are found in `frontend/src/web`.

Feature 1 – Agencies Page  <br>
There is an Agencies webpage which lists police agencies stored in the database. The user enters a form to query the database, which will then return information about all agencies that satisfy this query. <br>
Query <br>
SELECT A.AgencyID, A.AgencyName, A.Type, A.State, A.TotalShootings,<br> 
	JSONB_AGG(DISTINCT AI.IncidentID) AS IncidentIDs, JSONB_AGG(DISTINCT O.ori) 	 AS OriCodes <br>
FROM Agency A <br>
LEFT OUTER JOIN AgenciesInvolved AI ON A.AgencyID = AI.AgencyID <br>
LEFT OUTER JOIN ORICode O ON A.AgencyID = O.AgencyID <br>
LEFT OUTER JOIN AgenciesInvolved AI ON A.AgencyID = AI.AgencyID <br>
LEFT OUTER JOIN HasORICodes O ON A.AgencyID = O.AgencyID <br>
WHERE LOWER(A.AgencyName) LIKE “{SEARCH_TERM}” <br>
GROUP BY A.AgencyID <br>
ORDER BY A.AgencyID <br>

 
Feature 2 – Map Visualizer  
The website will contain map visualization capabilities such as the ability for users to visually see where incidents occurred on a map. <br>
Query <br>
SELECT IncidentID, V.Name, date, longitude, latitude <br>
FROM Incident I <br>
LEFT OUTER JOIN Victim V ON I.VictimID = V.VictimID <br>
WHERE longitude > ‘low_longitude’ AND longitude < ‘high_longitude’ AND <br>
          latitude > ‘low_latitude AND latitude < ‘high_latitude’ <br>
LIMIT 300; <br>
 
 
Feature 3 – Incident Search  <br>
The website will have a general search feature where users can search and filter for incidents by criteria such as name, location, agencies involved, victim race and victim gender. For example, given a full name, a query will be performed that will look for incidents where the victim’s name matches the given full name. <br>
Query <br>
SELECT I.IncidentID, I.Date, I.ThreatenType, I.FleeStatus, <br>
	I.ArmedWith, I.WasMentalIllnessRelated, I.BodyCamera, I.Latitude, <br>
	I.Longitude, <br>
	V.VictimID, V.Name, V.Age, V.Gender, V.Race, V.RaceSource, <br>
	JSONB_AGG(DISTINCT AI.AgencyID) AS AgencyIDs, <br>
	JSONB_AGG(A.AgencyName) AS AgencyNames, <br>
	C.CityID, C.CityName, C.County, C.State <br>
FROM Incident I <br>
LEFT OUTER JOIN Victim V ON I.VictimID = V.VictimID <br>
LEFT OUTER JOIN AgenciesInvolved AI ON I.IncidentID = AI.IncidentID <br>
LEFT OUTER JOIN Agency A ON AI.AgencyID = A.AgencyID <br>
LEFT OUTER JOIN City C ON I.CityID = C.CityID <br>
ORDER BY I.IncidentID <br>
 
 
Feature 4 – Report Submission  <br>
The website will contain a form which users can fill out to submit a report of a fatal police shooting incident. A query will then be performed which inserts this entry into the database. <br>
Query <br>
INSERT INTO Incident (IncidentID, Date, ThreatenType, FleeStatus, ArmedWith, 	WasMentalIllnessRelated, BodyCamera, Latitude, Longitude) <br>
VALUES (1, '2023-05-30', 'point', 'not', 'Gun', TRUE, TRUE, 123.456, 		789.012); <br>
INSERT INTO AgenciesInvolved (IncidentID, AgencyID) <br>
VALUES (‘agencyIDs’, UNNEST(ARRAY[agencyIDListString])); <br>
 
 
 
Feature 5 – Timeline Graph <br> 
The website will have a search feature where users can input an age number. A timeline graph will be shown which contains the number of incidents, percentage of those incidents which are related to mental illness and percentage of the victims who are armed with.  <br>
Query  <br>
SELECT  <br>
    DATE_PART('YEAR', I.date), <br>
    COUNT(*) AS total_number, <br>
    COUNT(CASE WHEN I.WasMentalIllnessRelated = true THEN 1 END) AS <br>
    mental_number, <br>
    COUNT(CASE WHEN I.ArmedWith = 'gun' THEN 1 END) AS gun, <br>
    COUNT(CASE WHEN I.ArmedWith = 'knife' THEN 1 END) AS knife, <br>
    COUNT(CASE WHEN I.ArmedWith = 'blunt_object' THEN 1 END) AS bo, <br>
    COUNT(CASE WHEN I.ArmedWith = 'replica' THEN 1 END) AS rep , <br>
    COUNT(CASE WHEN I.ArmedWith = 'unarmed' THEN 1 END) AS una,  <br>
    COUNT(CASE WHEN I.ArmedWith = 'vehicle' THEN 1 END) AS veh  <br>
    FROM Incident I NATURAL JOIN Victim V    <br>
    WHERE V.age = $1 <br>
    GROUP BY DATE_PART('YEAR', I.date) <br>
    ORDER BY DATE_PART('YEAR', I.date) <br>
  
 
 
Feature 6 – Bodycam Usage Percentage  <br>
The website will have a search feature where users can input a police department ID. A query will output the percentage of police officers from the given police department who wear a body camera when they are involved with an incident. <br>
Query <br>
SELECT COUNT(*) as count FROM Incident I <br>
JOIN AgenciesInvolved AI ON I.IncidentID = AI.IncidentID <br>
WHERE AI.AgencyID = “input_ID” AND I.BodyCamera = TRUE; <br>



## Mac setup
1. Install brew (https://brew.sh/).
2. Install Node.js: `brew install node`.
3. Clone the repository and `cd` to it.
4. Run `scripts/setup.sh`.
5. In one terminal, `cd` to the `backend` folder and run `npm start`.
6. In another terminal,`cd` to the `frontend` folder and run `npm start`.
## Windows setup
1. Download and install PostgreSQL server version 14.8 (https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
2. Install node (https://nodejs.org/en).
3. Add the PostgreSQL bin directory path to the PATH environment variable.
4. Login to the postgresql server: `psql -U postgres`.
5. Clone the repository and `cd` to it.
6. The `scripts/setup.sh` setup script only works on Mac, so perform the following steps manually:
7. Create a the user `cs348user` and give it the `CREATEDB` permission:
```
CREATE ROLE cs348user WITH LOGIN PASSWORD 'password';
ALTER ROLE cs348user CREATEDB;
```
8. Create the database *cs348* and make it accessible to the *cs348user* user:
```
CREATE DATABASE cs348;
GRANT ALL PRIVILEGES ON DATABASE cs348 TO cs348user;
\q
```
9. Login to the `cs348` database with `psql cs348 -U cs348user`
10. Now that the database is set up, in a new terminal, return to the repository root directory. `cd` to the `backend` folder and run the following:
```
npm install     # install dependencies
npm run dropdb  # clear tables
npm run initdb  # initialize the database and populate with sample data
npm start       # start the backend app
```
11. In a new terminal, return to the repository root directory, and `cd` to the `frontend` folder and run the following:
```
npm install     # install dependencies
npm start       # start the frontend app
```

### Useful postgresql commands
* \l: lists all databases
* \c <database>: connect to a database
* \dt: list tables
* \du: list users
* \q: quit
