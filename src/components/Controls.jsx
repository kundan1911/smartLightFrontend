import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Slider,
  ListItemIcon,
} from "@mui/material";
import Navbar from "./Navbar";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import BigSlider from "./BigSlider";
import EditableCard from "./EditableCard";
import SpeechToText from "./SpeechToText";
import {
  useUser
} from "@clerk/clerk-react";
import { useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

function LightControlCard() {
  // const [firsttoggleState, setfirstToggleState] = React.useState(false);
  // const [sectoggleState, setsecToggleState] = React.useState(false);
  const [lightStates, setLightStates] = useState();
  const [firintensity, setfirIntensity] = React.useState(50);
  const [firtemperature, setfirTemperature] = React.useState(50);
  const [secintensity, setsecIntensity] = React.useState(50);
  const [sectemperature, setsecTemperature] = React.useState(50);
  const [data, setData] = React.useState(null);
  const [socket, setSocket] = React.useState(null);
  const [userInput, setUserInput] = useState({ type: "" });
  const [masteronline, setmasteronline] = useState(false);
  const [notificationId, setNotificationId] = useState(null);
  const [newDeviceAdded, setnewDeviceAdded] = useState(false);
  const [grpIntensity, setgrpIntensity] = useState(0);
  const [controlledNode, setcontrolledNode] = useState(0);
  const [callonce, setCall] = React.useState(1);
  const { isSignedIn, user, isLoaded } = useUser();
  const [lightData, setlightData] = React.useState([]);
  const [controlData, setcontrolData] = React.useState([]);
  let { roomId } = useParams();
  var currentControlType;
  
  // useEffect(() => {
  //   // This block will be executed whenever intensity or temperature changes
  //   var inten, temp;
  //   if (currentControlType === 0) {
  //     inten = firintensity;
  //     temp = firtemperature;
  //   } else {
  //     inten = secintensity;
  //     temp = sectemperature;
  //   }
  //   axios
  //     .post("http://localhost:5002/setUpVal", {
  //       intensity: inten,
  //       temperature: temp,
  //       controlType: currentControlType,
  //     })
  //     .then((response) => {
  //       console.log(response.data); // Assuming the server sends back a success message
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, [firintensity, firtemperature, secintensity, sectemperature]); // The effect depends on intensity and temperature

  const DisplayAllRooms = () => {
    const email=user.emailAddresses[0].emailAddress
    console.log("axios post data",email)
    axios.get('http://localhost:5002/getAllLightControl',{
      params: {roomId,email} , // Use the updated chain value here
    })
      .then(response => {
        console.log("axios get data", response.data);
        setlightData(response.data.lights);
        setLightStates(Array(response.data.lights.length).fill(false))
      })
      .catch(error => {
        console.error(error);
      });

      axios.get('http://localhost:5002/getAllControl',{
        params: {roomId,email} , // Use the updated chain value here
      })
        .then(response => {
          console.log("axios get data", response.data);
          setcontrolData(response.data.lights);
        })
        .catch(error => {
          console.error(error);
        });
  }

  if (callonce === 1) {
    DisplayAllRooms();
    setCall(2);
  }

  // useEffect(() => {
  //   // This block will be executed whenever intensity or temperature changes
  //   axios
  //     .post("http://localhost:5002/setUpVal", {
  //       intensity: grpIntensity,
  //       controlType: 3,
  //     })
  //     .then((response) => {
  //       console.log(response.data); // Assuming the server sends back a success message
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, [grpIntensity]);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:5002"); // Replace with your server URL

    newSocket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log("toast call")
      // Check the type of alert and show corresponding toast
      if (data.alertType === "promptNumber") {
        showPromptNumberToast(data);
      } else if (data.alertType === "masterOnline") {
        console.log("Data Message:", data.message);

        if (data.message === "online") {
          // Your success toast and logic
          console.log("Master Online");
          toast.success(`Master Online`, {
            position: "top-right",
            autoClose: 5000,
          });
          setmasteronline(true);
        } else {
          // Your error toast and logic
          console.log("Master Offline");
          toast.error(`Master offline`, {
            position: "top-right",
            autoClose: 5000,
          });
          setmasteronline(false);
        }
      } else if (data.alertType === "success") {
        showSuccessToast(data);
        setnewDeviceAdded(true);
      } else if (data.alertType === "failure") {
        showFailureToast(data);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const showPromptNumberToast = (data) => {
    // Display a notification with an input field and a button
    const dataobje = JSON.parse(data.message);
    const notification = toast.info(
      <div>
        <p>{`New Device Discovered: DeviceId:-${dataobje.deviceUuid}`}</p>
        <input
          type="number"
          placeholder="Enter Control:-0 or light:-1"
          onChange={(e) => setUserInput(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleAddButtonClick} className="btn-add">
          Add
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 15000, // Auto-close the notification after 15 seconds
      }
    );
  
    // Save the notification ID to close it later
    setNotificationId(notification);
  };

  const showSuccessToast = (data) => {
    toast.success(`Success: ${data.message}`, {
      position: "top-right",
      autoClose: 5000, // Auto-close the success toast after 5 seconds
    });
    console.log(data)
    if(data.unicastAddr){
      console.log(lightData)
      if(data.Type=='1')
    setlightData([...lightData,{unicastAddr:data.unicastAddr}])
  else{
    console.log("updating control")
  setcontrolData([...controlData,{controlId:data.unicastAddr}])
  }
    }
    
  };

  const showFailureToast = (data) => {
    toast.error(`Failure: ${data.message}`, {
      position: "top-right",
      autoClose: 5000, // Auto-close the failure toast after 5 seconds
    });

  };

  const handleAddButtonClick = () => {
    toast.dismiss(notificationId);
    // Send the user's input back to the backend when the Add button is clicked
    setUserInput((prevUserInput) => {
      handleNotificationInteraction(prevUserInput);
      console.log(prevUserInput)
      // handleNotificationInteraction(prevUserInput);
      //  he input field after sending
    });
    // 
   
  };
  
  const handleNotificationInteraction = (data) => {
    // Send the user's input back to the backend
    // toast.dismiss(notificationId);
    // console.log("num:", parseInt(data.number));
    axios
      .post("http://localhost:5002/setUnicast", {
        type: data,
        roomId:roomId,
        userEmail:user.emailAddresses[0].emailAddress,
      })
      .then((response) => {
        console.log(response.data); // Assuming the server sends back a success message
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleToggleChange = (event, lightIndex, unicastAddr) => {
    const newLightStates = [...lightStates];
    newLightStates[lightIndex] = event.target.checked;
    console.log(newLightStates[lightIndex]);
    setLightStates(newLightStates);
    axios
      .post("http://localhost:5002/setUpVal", {
        intensity: newLightStates[lightIndex] ? 100 : 0,
        temperature: 0,
        unicastAddr:unicastAddr
      })
      .then((response) => {
        console.log(response.data); // Assuming the server sends back a success message
      })
      .catch((error) => {
        console.error(error);
      });
    // if (type === 0) setfirstToggleState(togglePosition);
    // else setsecToggleState(togglePosition);
  };

  const handleRemoveLight=(id)=>{
    console.log("remove light", id)
    axios
      .post("http://localhost:5002/removeLightNode", {
        lightId: id,
      })
      .then((response) => {
        console.log(response.data); // Assuming the server sends back a success message
        // remove the light using the id from LightData by updating setLightData
        setlightData(lightData.filter(light => light._id !== id));
      })
      .catch((error) => {
        console.error(error);
      });
  }
  const valueIntensity = (value, unicastAddr) => {
    // currentControlType = type;
    console.log(unicastAddr)

    console.log("intensity",value)
    axios
      .post("http://localhost:5002/setUpVal", {
        intensity: value,
        unicastAddr:unicastAddr
      })
      .then((response) => {
        console.log(response.data); // Assuming the server sends back a success message
      })
      .catch((error) => {
        console.error(error);
      });
    // if 
    // currentControlType = type;
    // console.log(intensity);
  };
  const grpSliderIntensity = (value) => {
    setgrpIntensity(value);
  };

  const valueTemp = (value, unicastAddr) => {
    // currentControlType = type;
    console.log(unicastAddr)
  
    console.log("temperat",value); // Use the argument directly, not the state variable
    axios
      .post("http://localhost:5002/setUpVal", {
        temperature: value,
        unicastAddr:unicastAddr
      })
      .then((response) => {
        console.log(response.data); // Assuming the server sends back a success message
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const updateControllight=(controlId,lightIndex)=>{
  
console.log("update control light", controlId, lightIndex)
const light=lightData[lightIndex]
if(light){
  console.log("light data", light)
  axios
  .post("http://localhost:5002/updateControlLight", {
    controlUnicastAddr: controlId,
    lightUnicastAddr:light.unicastAddr
  })
  .then((response) => {
    console.log(response.data); // Assuming the server sends back a success message
  })

  .catch((error) => {
    console.error(error);
  });
}
  }
  const displayIndex=(index,state)=>{
    console.log("receive voice control index:%d and state %d",index,state)
    // Create a new array based on the current state
  const newLightStates = [...lightStates];
  console.log(newLightStates)
  console.log(state)
  // Update the state for the specific light
  newLightStates[index] = state > 0;
 
  // Set the state with the updated array
  setLightStates(newLightStates);
  }
  const IOSSwitch = styled((props) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#33cf4d",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));

  return (
    <>
      <Navbar />
      <BigSlider
        grpSliderIntensity={grpSliderIntensity}
        grpIntensity={grpIntensity}
      />
      <Typography
          variant="h4"
          sx={{
            fontFamily: "Verdana",
            ml: 4,
          }}
          marginBottom={3}
        >
          Lights
        </Typography>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
      {lightData.map((light,Index) => (
        <Card
          sx={{
            position: 'relative',
            width: "240px",
            height: "auto",
            boxShadow: "none",
            ml: 4,
            mb: 2,
            borderRadius: 2,
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            border: "1px solid lightblue",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            },
          }}
        >
          <CardContent>
          <CloseIcon
    onClick={() => handleRemoveLight(light._id)}
    sx={{
      position: 'absolute', // Position the CloseIcon absolutely
      top: 0, // Align it to the top of the card
      right: 0, // Align it to the right of the card
      cursor: 'pointer',
      zIndex: 1, // Ensure it's above other content
    }}
  />

            <Typography
              variant="h6"
              component="div"
              sx={{ fontFamily: "Verdana" }}
            >
              BLE Node: {Index+1}
            </Typography>
            <div style={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
                control={<IOSSwitch sx={{ m: 1.4 }} checked={lightStates[Index]} onChange={(event) => handleToggleChange(event, Index, light.unicastAddr)} />}
                label=""
              />
              <ListItemIcon>
                <LightbulbIcon sx={{ color: lightStates[Index] ? "yellow" : "inherit" }} />
              </ListItemIcon>
            </div>
            {/* {masteronline ? ( */}
              <div>
                <Typography variant="body2" color="text.secondary">
                  intensity
                </Typography>
                <Slider
                  aria-label="Intensity"
                  defaultValue={30}
                  onChange={(event, value) => valueIntensity(value, light.unicastAddr)}
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={0}
                  max={100}
                />
                <Typography variant="body2" color="text.secondary">
                  temperature
                </Typography>
                <Slider
                  aria-label="Temperature"
                  defaultValue={30}
                  onChange={(event, value) => valueTemp(value, light.unicastAddr)}
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={0}
                  max={100}
                />{" "}
              </div>
            {/* ) : (
              <div>
                <Typography color={"red"}>🔴 Not available</Typography>
              </div>
            )
            } */}
          </CardContent>
        </Card>
         ))
         }
       
      </div>
     
      <Typography
          variant="h4"
          sx={{
            fontFamily: "Verdana",
            ml: 4,
          }}
        >
          Controllers
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
        {controlData.map((control,index)=>(
           <div>
       
        <EditableCard
        index={index} 
          controlId={control.controlId}
          updateControllight={(controlId,lightindex)=>{updateControllight(controlId,lightindex)}}
        />
      </div>
        )
  )}
  </div>
      <ToastContainer />
      <SpeechToText roomId={roomId} userEmail={user.emailAddresses[0].emailAddress} gettheIndex={displayIndex}/>
    </>
  );
}

export default LightControlCard;
