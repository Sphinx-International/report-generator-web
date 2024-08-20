type CerteficatType ={
    name:string,
    color:string,
    type: 1 | 2 | 3
  }
  
  export const certeficatTypes: CerteficatType[] = [
    { name: "Rejected", color: "#DB2C2C", type:3 },
    { name: "Accepted with reserve", color: "#FFAA29", type:2 },
    { name: "Accepted", color: "#48C1B5", type:1 },
  ];