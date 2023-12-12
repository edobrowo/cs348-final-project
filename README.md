# CS 348 Group Project
For more information, read [CS 348 Project - Final Report.pdf](https://github.com/edobrowo/cs348-final-project/blob/main/CS%20348%20Project%20-%20Final%20Report.pdf)
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

### Feature 1 – Agencies Page
There is an Agencies webpage which lists police agencies stored in the database. The user enters a form to query the database, which will then return information about all agencies that satisfy this query.

```sql
SELECT A.AgencyID, A.AgencyName, A.Type, A.State, A.TotalShootings,
	JSONB_AGG(DISTINCT AI.IncidentID) AS IncidentIDs, JSONB_AGG(DISTINCT O.ori) AS OriCodes
	FROM Agency A
	LEFT OUTER JOIN AgenciesInvolved AI ON A.AgencyID = AI.AgencyID
	LEFT OUTER JOIN ORICode O ON A.AgencyID = O.AgencyID
	LEFT OUTER JOIN AgenciesInvolved AI ON A.AgencyID = AI.AgencyID
	LEFT OUTER JOIN HasORICodes O ON A.AgencyID = O.AgencyID
	WHERE LOWER(A.AgencyName) LIKE "{SEARCH_TERM}"
	GROUP BY A.AgencyID
	ORDER BY A.AgencyID
```

### Feature 2 – Map Visualizer  
The website will contain map visualization capabilities such as the ability for users to visually see where incidents occurred on a map.

```sql
SELECT IncidentID, V.Name, date, longitude, latitude
	FROM Incident I
	LEFT OUTER JOIN Victim V ON I.VictimID = V.VictimID
	WHERE longitude > 'low_longitude' AND longitude < 'high_longitude' AND
	          latitude > 'low_latitude' AND latitude < 'high_latitude'
	LIMIT 300
```

### Feature 3 – Incident Search
The website will have a general search feature where users can search and filter for incidents by criteria such as name, location, agencies involved, victim race and victim gender. For example, given a full name, a query will be performed that will look for incidents where the victim’s name matches the given full name.

```sql
SELECT I.IncidentID, I.Date, I.ThreatenType, I.FleeStatus,
		I.ArmedWith, I.WasMentalIllnessRelated, I.BodyCamera, I.Latitude,
		I.Longitude,
		V.VictimID, V.Name, V.Age, V.Gender, V.Race, V.RaceSource,
		JSONB_AGG(DISTINCT AI.AgencyID) AS AgencyIDs,
		JSONB_AGG(A.AgencyName) AS AgencyNames,
		C.CityID, C.CityName, C.County, C.State
	FROM Incident I
	LEFT OUTER JOIN Victim V ON I.VictimID = V.VictimID
	LEFT OUTER JOIN AgenciesInvolved AI ON I.IncidentID = AI.IncidentID
	LEFT OUTER JOIN Agency A ON AI.AgencyID = A.AgencyID
	LEFT OUTER JOIN City C ON I.CityID = C.CityID
	ORDER BY I.IncidentID
```

### Feature 4 – Report Submission
The website will contain a form which users can fill out to submit a report of a fatal police shooting incident. A query will then be performed which inserts this entry into the database.

```sql
INSERT INTO Incident (IncidentID, Date, ThreatenType, FleeStatus, ArmedWith, WasMentalIllnessRelated, BodyCamera, Latitude, Longitude)
	VALUES (1, '2023-05-30', 'point', 'not', 'Gun', TRUE, TRUE, 123.456, 789.012);
	INSERT INTO AgenciesInvolved (IncidentID, AgencyID)
	VALUES ('agencyIDs', UNNEST(ARRAY[agencyIDListString]))
```

### Feature 5 – Timeline Graph
The website will have a search feature where users can input an age number. A timeline graph will be shown which contains the number of incidents, percentage of those incidents which are related to mental illness and percentage of the victims who are armed with.

```sql
SELECT
    DATE_PART('YEAR', I.date),
    COUNT(*) AS total_number,
    COUNT(CASE WHEN I.WasMentalIllnessRelated = true THEN 1 END) AS
    mental_number,
    COUNT(CASE WHEN I.ArmedWith = 'gun' THEN 1 END) AS gun,
    COUNT(CASE WHEN I.ArmedWith = 'knife' THEN 1 END) AS knife,
    COUNT(CASE WHEN I.ArmedWith = 'blunt_object' THEN 1 END) AS bo,
    COUNT(CASE WHEN I.ArmedWith = 'replica' THEN 1 END) AS rep,
    COUNT(CASE WHEN I.ArmedWith = 'unarmed' THEN 1 END) AS una,
    COUNT(CASE WHEN I.ArmedWith = 'vehicle' THEN 1 END) AS veh
    FROM Incident I NATURAL JOIN Victim V
    WHERE V.age = $1
    GROUP BY DATE_PART('YEAR', I.date)
    ORDER BY DATE_PART('YEAR', I.date)
```

### Feature 6 – Bodycam Usage Percentage
The website will have a search feature where users can input a police department ID. A query will output the percentage of police officers from the given police department who wear a body camera when they are involved with an incident.

```sql
SELECT COUNT(*) as count FROM Incident I
	JOIN AgenciesInvolved AI ON I.IncidentID = AI.IncidentID
	WHERE AI.AgencyID = "input_ID" AND I.BodyCamera = TRUE
```

## Mac setup
1. Install brew (https://brew.sh/).
2. Install Node.js: `brew install node`.
3. Clone the repository and `cd` to it.
4. Run `scripts/setup.sh`.
5. In one terminal, `cd` to the `backend` folder and run `npm start`.
6. In another terminal,`cd` to the `frontend` folder and run `npm start`.
7. 
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
