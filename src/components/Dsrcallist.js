import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import DSRnav from "./DSRnav";
import moment from "moment";
import { Co2Sharp } from "@mui/icons-material";

function Dsrcallist() {
  const apiURL = process.env.REACT_APP_API_URL;
  const { date, category } = useParams();

  const [treatmentData, settreatmentData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [dsrdata1, setdsrdata1] = useState([]);
  const [searchJobCatagory, setSearchJobCatagory] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchTechName, setSearchTechName] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [searchDesc, setSearchDesc] = useState("");

  console.log("dsrdata1", dsrdata1);
  const [searchpaymentMode, setsearchpaymentMode] = useState("");

  useEffect(() => {
    getservicedata();
  }, [category, date]);

  const getservicedata = async () => {
    try {
      let res = await axios.get(apiURL + "/getservicedatawithaddcal", {
        params: {
          category: category,
          date: date,
        },
      });

      if (res.status === 200) {
        settreatmentData(res.data?.runningdata);
        setSearchResults(res.data?.runningdata);
      }
    } catch (error) {
      // Handle errors
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getAlldata();
  }, [treatmentData]);

  const getAlldata = async () => {
    try {
      const res = await axios.get(apiURL + `/filteredservicedate/${date}`);

      if (res.status === 200) {
        setdsrdata1(res.data.filterwithservicedata);
      }
    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    async function filterResults() {
      try {
        let results = treatmentData;
        if (searchJobCatagory) {
          results = results.filter(
            (item) =>
              item.jobCategory &&
              item.jobCategory
                .toLowerCase()
                .includes(searchJobCatagory.toLowerCase())
          );
        }
        if (searchCustomerName) {
          results = results.filter(
            (item) =>
              item.customerData[0]?.customerName &&
              item.customerData[0]?.customerName
                .toLowerCase()
                .includes(searchCustomerName.toLowerCase())
          );
        }
        if (searchCity) {
          results = results.filter(
            (item) =>
              item.city &&
              item.city.toLowerCase().includes(searchCity.toLowerCase())
          );
        }
        if (searchAddress) {
          results = results.filter(
            (item) =>
              (item.customerData[0]?.cnap &&
                item.customerData[0]?.cnap
                  .toLowerCase()
                  .includes(searchAddress.toLowerCase())) ||
              (item.customerData[0]?.rbhf &&
                item.customerData[0]?.rbhf
                  .toLowerCase()
                  .includes(searchAddress.toLowerCase()))
          );
        }
        if (searchContact) {
          results = results.filter((item) => {
            const mainContact = item.customerData[0]?.mainContact;
            if (typeof mainContact === "string") {
              return mainContact
                .toLowerCase()
                .includes(searchContact.toLowerCase());
            } else if (typeof mainContact === "number") {
              const stringMainContact = String(mainContact); // Convert number to string
              return stringMainContact
                .toLowerCase()
                .includes(searchContact.toLowerCase());
            }
            return false; // Exclude if mainContact is neither string nor number
          });
        }

        if (searchTechName) {
          results = results.filter(
            (item) =>
              item.dsrdata[0]?.TechorPMorVendorName &&
              item.dsrdata[0]?.TechorPMorVendorName.toLowerCase().includes(
                searchTechName.toLowerCase()
              )
          );
        }
        if (searchJobType) {
          results = results.filter(
            (item) =>
              item.service &&
              item.service.toLowerCase().includes(searchJobType.toLowerCase())
          );
        }
        if (searchDesc) {
          results = results.filter(
            (item) =>
              item.desc &&
              item.desc.toLowerCase().includes(searchDesc.toLowerCase())
          );
        }
        if (searchpaymentMode) {
          results = results.filter(
            (item) =>
              item.paymentMode &&
              item.paymentMode
                .toLowerCase()
                .includes(searchpaymentMode.toLowerCase())
          );
        }
        setSearchResults(results);
      } catch (error) {
        console.log("Error in Search", error);
      }
    }
    filterResults();
  }, [
    searchJobCatagory,
    searchCustomerName,
    searchCity,
    searchAddress,
    searchContact,
    searchJobType,
    searchDesc,
    searchpaymentMode,
    searchTechName,
  ]);

  let i = 1;

  const passfunction = (sId) => {
    const filt = dsrdata1.filter(
      (i) => i.serviceInfo[0]?._id === sId._id && i.serviceDate === date
    );
    const TTnameValue = filt[0]?.TechorPMorVendorName;

    return TTnameValue;
  };
  useEffect(() => {
    SERVICESTARTED();
  }, []);

  const SERVICESTARTED = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) =>
        item.serviceInfo[0]?._id === service?._id && item?.serviceDate === date
    );

    return filterStartTime[0]?.startJobTime;
  };

  const SERVICECOMPLETED = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) =>
        item.serviceInfo[0]?._id === service?._id && item.serviceDate === date
    );
    return filterStartTime[0]?.endJobTime;
  };

  const SERVICECOMPLETEDBYOP = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) =>
        item.serviceInfo[0]?._id === service?._id && item.serviceDate == date
    );

    return filterStartTime[0]?.jobComplete;
  };

  const SERVICECANCLE = (service) => {
    const filterStartTime = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service._id
    );

    return filterStartTime[0]?.jobComplete;
  };

  const SERVICEMode = (service) => {
    const filterpaymentmde = dsrdata1.filter(
      (item) => item.serviceInfo[0]?._id === service._id
    );

    return filterpaymentmde[0]?.paymentType;
  };
  const returndata = (data) => {
    const dateToMatch = new Date(date);
    const matchingData = [];

    let charge = 0;
    data.dividedamtDates.forEach((dateObj, index) => {
      const dividedDate = new Date(dateObj.date);
      if (dividedDate.getDate() === dateToMatch.getDate()) {
        matchingData.push({
          date: dateObj.date,
          charge: data.dividedamtCharges[index].charge,
        });
      }
    });

    return matchingData[0]?.charge;
  };

  return (
    <div className="web">
      <Header />
      <DSRnav />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div className="shadow-sm" style={{ border: "1px #cccccc solid" }}>
          <div
            className="ps-1 pe-1"
            style={{ borderBottom: "1px #cccccc solid" }}
          >
            NOT ASSIGNED
          </div>
          <div
            className="ps-1 pe-1"
            style={{
              backgroundColor: "#e2e3e5",
            }}
          >
            ASSIGNED FOR TECHNICIAN
          </div>
          <div
            className="ps-1 pe-1"
            style={{
              backgroundColor: "#ffeb3b",
            }}
          >
            SERVICE STARTED
          </div>
          <div className="ps-1 pe-1" style={{ backgroundColor: "#4caf50" }}>
            SERIVCE COMPLETED
          </div>
          <div className="ps-1 pe-1" style={{ backgroundColor: "#f44336" }}>
            SERIVCE CANCELLED
          </div>
          <div className="ps-1 pe-1" style={{ backgroundColor: "#2196f3" }}>
            SERIVCE DELAYED
          </div>
          <div
            className="ps-1 pe-1"
            style={{ backgroundColor: "rgb(182, 96, 255)" }}
          >
            CLOSED OPERATION MANAGER
          </div>
        </div>
      </div>
      <div className="row m-auto">
        <div className="col-md-12">
          <table
            class="table table-hover table-bordered mt-1"
            style={{ width: "113%" }}
          >
            <thead className="">
              <tr className="table-secondary">
                {/* <th className="table-head" scope="col"></th> */}
                <th className="table-head" scope="col"></th>

                <th
                  className="table-head"
                  style={{ width: "7%" }}
                  scope="col"
                ></th>
                <th scope="col" className="table-head" style={{ width: "7%" }}>
                  <input
                    className="vhs-table-input"
                    value={searchJobCatagory}
                    onChange={(e) => setSearchJobCatagory(e.target.value)}
                  />{" "}
                </th>

                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchCustomerName}
                    onChange={(e) => setSearchCustomerName(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <select
                    className="vhs-table-input"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  >
                    <option value="">Select</option>
                    {[...new Set(treatmentData.map((city) => city.city))].map(
                      (uniqueCity) => (
                        <option value={uniqueCity} key={uniqueCity}>
                          {uniqueCity}
                        </option>
                      )
                    )}
                  </select>{" "}
                </th>
                <th scope="col" style={{ width: "15%" }} className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                  />{" "}
                </th>
                <th scope="col" className="table-head">
                  {/* <select
                    className="vhs-table-input" //no Technician name
                    value={searchTechName}
                    onChange={(e) => setSearchTechName(e.target.value)}
                  >
                    <option value="">Select</option>
                    {dsrdata.map((e) => (
                      <option
                        value={e.TechorPMorVendorName}
                        key={e.TechorPMorVendorName}
                      >
                        {e.TechorPMorVendorName}{" "}
                      </option>
                    ))}
                  </select>{" "} */}

                  <select
                    className="vhs-table-input"
                    value={searchTechName}
                    onChange={(e) => setSearchTechName(e.target.value)}
                  >
                    <option value="">Select</option>
                    {[
                      ...new Set(
                        treatmentData.map(
                          (item) => item.dsrdata[0]?.TechorPMorVendorName
                        )
                      ),
                    ].map((uniqueName) => (
                      <option value={uniqueName} key={uniqueName}>
                        {uniqueName}
                      </option>
                    ))}
                  </select>
                </th>
                {/* <th scope="col" className="table-head">
                
                </th> */}
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchJobType}
                    onChange={(e) => setSearchJobType(e.target.value)}
                  />{" "}
                </th>

                <th scope="col" className="table-head"></th>
                <th scope="col" className="table-head">
                  <select
                    className="vhs-table-input"
                    value={searchpaymentMode}
                    onChange={(e) => setsearchpaymentMode(e.target.value)}
                  >
                    <option value="">Select</option>

                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>{" "}
                </th>
                <th scope="col" className="table-head">
                  <input
                    className="vhs-table-input"
                    value={searchDesc}
                    onChange={(e) => setSearchDesc(e.target.value)}
                  />{" "}
                </th>
              </tr>
              <tr className="table-secondary">
                <th className="table-head" scope="col">
                  Sr.No
                </th>
                {/* <th className="table-head" scope="col">
                  Category
                </th> */}
                <th className="table-head" scope="col">
                  Date
                </th>
                <th className="table-head" scope="col">
                  Time
                </th>

                <th scope="col" className="table-head">
                  Customer Name
                </th>
                <th scope="col" className="table-head">
                  City
                </th>
                <th scope="col" style={{ width: "15%" }} className="table-head">
                  Address
                </th>
                <th scope="col" className="table-head">
                  Contact No.
                </th>

                <th scope="col" className="table-head">
                  Technician
                </th>

                {/* <th scope="col" className="table-head">
                  Worker Name
                </th> */}
                <th scope="col" className="table-head">
                  Job Type
                </th>

                <th scope="col" className="table-head">
                  Job Amount
                </th>
                <th scope="col" className="table-head">
                  Payment mode
                </th>
                <th scope="col" className="table-head">
                  Description
                </th>

                {/* <th scope="col" className="table-head">
                  Amount
                </th> */}
              </tr>
            </thead>
            <tbody>
              {searchResults?.map((selectedData, index) => (
                // const chargeForCurrentRow = charge[index] || 0;
                <tr
                  className="user-tbale-body"
                  key={index}
                  style={{
                    backgroundColor:
                      SERVICECOMPLETEDBYOP(selectedData) === "YES"
                        ? "rgb(182, 96, 255)"
                        : SERVICECOMPLETED(selectedData)
                        ? "#4caf50"
                        : SERVICECANCLE(selectedData) === "CANCEL"
                        ? "#f44336"
                        : SERVICESTARTED(selectedData)
                        ? "#ffeb3b"
                        : passfunction(selectedData)
                        ? "#e2e3e5"
                        : "",
                  }}
                >
                  <Link
                    to="/dsrdetails "
                    className="tbl"
                    state={{
                      data: selectedData,
                      data1: date,
                      TTname: selectedData.dsrdata[0]?.TechorPMorVendorName,
                    }}
                  >
                    <td>{i++}</td>
                    {/* <td>{selectedData.category}</td> */}
                    <td>
                      {date} 
                    </td>
                    <td>{selectedData.selectedSlotText}</td>

                    <td>{selectedData.customerData[0]?.customerName}</td>

                    {/* {selectedData.city ? (
                      <td>{selectedData.city}</td>
                    ) : ( */}
                    <td>{selectedData?.city}</td>
                    {/* )} */}
                    <td>
                      {selectedData?.deliveryAddress
                        ? `
                        ${selectedData.deliveryAddress?.platNo},
                        ${selectedData.deliveryAddress?.address} - 
                        ${selectedData.deliveryAddress?.landmark}
                        `
                        : ""}
                    </td>

                    <td>{selectedData.customerData[0]?.mainContact}</td>

                    <td>
                      {selectedData.dsrdata &&
                        selectedData.dsrdata.length > 0 && (
                          <p>{selectedData.dsrdata[0]?.TechorPMorVendorName}</p>
                        )}

                      {/* {passfunction(selectedData)} */}

                      {selectedData?.dsrdata[0]?.Tcanceldate && (
                        <>
                          <p
                            style={{
                              textDecoration: "underline",
                              marginBottom: 0,
                            }}
                          >
                            Cancel details
                          </p>
                          <p style={{ color: "red" }}>
                            {selectedData?.dsrdata[0]?.Tcanceldate}
                            <br />
                            {selectedData?.dsrdata[0]?.Tcancelreason}
                          </p>
                        </>
                      )}

                      {selectedData?.dsrdata[0]?.rescheduledate && (
                        <>
                          <p
                            style={{
                              textDecoration: "underline",
                              marginBottom: 0,
                            }}
                          >
                            Reschedule details
                          </p>
                          <p style={{ color: "orange" }}>
                            {selectedData?.dsrdata[0]?.rescheduledate}
                            <br />
                            {selectedData?.dsrdata[0]?.reschedulereason}
                            <br />
                            {selectedData?.dsrdata[0]?.rescheduletime}
                          </p>
                        </>
                      )}
                    </td>

                    {/* <td>{dsrdata[0]?.workerName}</td> */}

                    <td>{selectedData.service}</td>

                    {selectedData.type === "userapp" ? (
                      <td>{selectedData?.GrandTotal}</td>
                    ) : (
                      <td>
                        {selectedData.contractType === "AMC"
                          ? returndata(selectedData)
                            ? returndata(selectedData)
                            : "0"
                          : selectedData.serviceCharge}
                      </td>
                    )}
                    {selectedData.type === "userapp" ? (
                      <td>{selectedData.paymentMode}</td>
                    ) : (
                      <td>{SERVICEMode(selectedData)}</td>
                    )}

                    <td>{selectedData.desc}</td>
                  </Link>
                </tr>
              ))}
            </tbody>
          </table>{" "}
        </div>
      </div>
    </div>
  );
}

export default Dsrcallist;
