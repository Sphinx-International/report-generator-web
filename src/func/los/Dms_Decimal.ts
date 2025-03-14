export type DimensionDMS = {
  degrees: number | null;
  minutes: number | null;
  seconds: number | string | null;
  direction: "N" | "S" | "E" | "W";
};

export const decimalToDMS = (decimal: number, isLatitude: boolean = true) => {
  const degrees = Math.floor(Math.abs(decimal));
  const minutesDecimal = (Math.abs(decimal) - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(8);

  const direction = isLatitude
    ? decimal >= 0
      ? "N"
      : "S"
    : decimal >= 0
    ? "E"
    : "W";
  return {
    degrees: degrees,
    minutes: minutes,
    seconds: parseFloat(seconds),
    direction: direction as "N" | "S" | "E" | "W",
  };
};

export const updateDMSFromDecimal = (
  decimal: string,
  setDMS: React.Dispatch<
    React.SetStateAction<{
      degrees: number | null;
      minutes: number | null;
      seconds: number | string | null;
      direction: "N" | "S" | "E" | "W";
    }>
  >,
  isLatitude: boolean,
  setFormValue: React.Dispatch<React.SetStateAction<any>>
) => {
  const { degrees, minutes, seconds, direction } = decimalToDMS(
    Number(decimal),
    isLatitude
  );

  setDMS({
    degrees: degrees ?? null,
    minutes: minutes ?? null,
    seconds: seconds ?? null,
    direction: direction as "N" | "S" | "E" | "W",
  });

  // Update formValue with the decimal value
  setFormValue((prevFormValue: any) => ({
    ...prevFormValue,
    [isLatitude ? "latitude" : "longitude"]: decimal,
  }));
};

function DMSToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: "N" | "S" | "E" | "W"
): number {
  let decimal = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600;

  // Make decimal negative if direction is S (south) or W (west)
  if (direction === "S" || direction === "W") {
    decimal = -decimal;
  }

  return decimal;
}

export const handleDMSChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setDMS: React.Dispatch<React.SetStateAction<DimensionDMS>>,
  isLatitude: boolean,
  setFormValue: React.Dispatch<React.SetStateAction<any>>
) => {
  const { name, value } = e.target;

  setDMS((prevState) => {
    const updatedState = {
      ...prevState,
      [name]: value === "" ? null : value,
    };

    // Determine the direction based on isLatitude flag
    const decimalValue = DMSToDecimal(
      updatedState.degrees || 0, // Use 0 if null for calculation
      updatedState.minutes || 0,
      Number(updatedState.seconds) || 0,
      updatedState.direction
    );

    setFormValue((prevFormValue: any) => ({
      ...prevFormValue,
      [isLatitude ? "latitude" : "longitude"]: decimalValue,
    }));

    return updatedState;
  });
};

export const handleDMSDirectionChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setDMS: React.Dispatch<React.SetStateAction<DimensionDMS>>,
  isLatitude: boolean,
  setFormValue: React.Dispatch<React.SetStateAction<any>>
) => {
  const { value } = e.target;

  setDMS((prevState) => {
    const updatedState = {
      ...prevState,
      direction: value as "N" | "S" | "E" | "W",
    };

    const decimalValue = DMSToDecimal(
      updatedState.degrees || 0,
      updatedState.minutes || 0,
      Number(updatedState.seconds) || 0,
      updatedState.direction
    );

    setFormValue((prevFormValue: any) => ({
      ...prevFormValue,
      [isLatitude ? "latitude" : "longitude"]: decimalValue,
    }));

    return updatedState;
  });
};

export const handleSingleDMSChange = (
  field: "degrees" | "minutes" | "seconds" | "direction",
  value: string | number,
  isLatitude: boolean,
  currentDecimal: number,
  setFormValue: React.Dispatch<React.SetStateAction<any>>
) => {
  // Helper to convert decimal to DMS
  const decimalToDMS = (decimal: number, isLatitude: boolean) => {
    const direction = isLatitude
      ? decimal >= 0
        ? "N"
        : "S"
      : decimal >= 0
      ? "E"
      : "W";

    const absDecimal = Math.abs(decimal);
    const degrees = Math.floor(absDecimal);
    const minutes = Math.floor((absDecimal - degrees) * 60);
    const seconds = Number(
      ((absDecimal - degrees - minutes / 60) * 3600).toFixed(2)
    );

    return { degrees, minutes, seconds, direction };
  };

  // Helper to convert DMS to decimal
  const DMSToDecimal = (
    degrees: number,
    minutes: number,
    seconds: number,
    direction: string
  ) => {
    const sign = direction === "S" || direction === "W" ? -1 : 1;
    return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
  };

  // Get current DMS values from the current decimal
  const currentDMS = decimalToDMS(currentDecimal, isLatitude);

  // Skip update if `value` is an incomplete input (e.g., ends with ".")
  if (field === "seconds" && value.toString().endsWith(".")) {
    return; // Do nothing
  }

  // Update the appropriate field
  const updatedDMS = {
    ...currentDMS,
    [field]: field === "direction" ? value : Number(value),
  };

  // Ensure valid direction for latitude and longitude
  if (field === "direction") {
    const validDirs = isLatitude ? ["N", "S"] : ["E", "W"];
    if (!validDirs.includes(value as string)) {
      throw new Error(
        `Invalid direction for ${isLatitude ? "latitude" : "longitude"}`
      );
    }
  }

  // Convert updated DMS back to decimal
  const updatedDecimal = DMSToDecimal(
    updatedDMS.degrees || 0,
    updatedDMS.minutes || 0,
    updatedDMS.seconds || 0,
    updatedDMS.direction as string
  );

  // Update the form value
  setFormValue((prevFormValue: any) => ({
    ...prevFormValue,
    [isLatitude ? "latitude" : "longitude"]: updatedDecimal,
  }));
};
