import React from "react";
import Incident from "./Incident";

/*
interface agencyData {
    agencyid: int;
    agencyname: string;
    incidentids: int[];
    oricodes: string[];
    state: string;
    totalshootings: int;
    type: string;
}
*/

const Agency = ({ agencyData }) => {
  return (
    <div>
      <h2>{agencyData.agencyname}</h2>
      <p>ID: {agencyData.agencyid}</p>
      <p>State: {agencyData.state}</p>
      <p>Oricodes: {agencyData.oricodes}</p>
      <p>Agency type: {agencyData.type}</p>
      <p>Total shootings: {agencyData.totalshootings}</p>
      {agencyData.incidentids.length > 0 ? (
        <div>
          <p>Incidents:</p>
          <ul>
            {agencyData.incidentids.map((incidentid) => (
              <li key={incidentid}>
                <Incident key={incidentid} incidentid={incidentid}></Incident>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Agency;