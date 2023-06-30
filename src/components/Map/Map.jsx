import { useState, useRef, useMemo } from "react";
// import { useMapEvents } from "react-leaflet/hooks";
// import mapuser from "../../assets/logos/mapuser.svg";
import "./Map.css";

import L from "leaflet";
import headphone_red from "../../assets/logos/headphone_red.svg";
import headphone_green from "../../assets/logos/headphone_green.svg";

import phone_green from "../../assets/logos/phone_green.svg";
import phone_red from "../../assets/logos/phone_red.svg";

import wallet_green from "../../assets/logos/wallet_green.svg";
import wallet_red from "../../assets/logos/wallet_red.svg";

import key_green from "../../assets/logos/key_green.svg";
import key_red from "../../assets/logos/key_red.svg";

import others_red from "../../assets/logos/others_red.svg";
import others_green from "../../assets/logos/others_green.svg";
import others_black from "../../assets/logos/others_black.svg";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useDisclosure } from "@chakra-ui/react";
import InfoModal from "../InfoModal/InfoModal";

import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Map({
  itemDate,
  data,
  isEdit,
  type,
  isLost,
  name,
  email,
  image,
  description,
  setIsEdit,
  search,
  findFilter,
  setIsCreate,
  setData,
  isCreate,
  centerPosition,
  position,
  setPosition,
  onOpen2,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemData, setItemData] = useState({});
  // const mapUser = L.icon({
  //   iconUrl: mapuser,
  //   iconSize: [50, 50],
  // });

  const headphoneLost = L.icon({
    iconUrl: headphone_red,
    iconSize: [50, 50],
  });

  const headphoneFound = L.icon({
    iconUrl: headphone_green,
    iconSize: [50, 50],
  });

  const phoneLost = L.icon({
    iconUrl: phone_red,
    iconSize: [50, 50],
  });

  const phoneFound = L.icon({
    iconUrl: phone_green,
    iconSize: [50, 50],
  });

  const keyLost = L.icon({
    iconUrl: key_red,
    iconSize: [50, 50],
  });

  const keyFound = L.icon({
    iconUrl: key_green,
    iconSize: [50, 50],
  });

  const walletLost = L.icon({
    iconUrl: wallet_red,
    iconSize: [50, 50],
  });

  const walletFound = L.icon({
    iconUrl: wallet_green,
    iconSize: [50, 50],
  });

  const othersLost = L.icon({
    iconUrl: others_red,
    iconSize: [50, 50],
  });

  const othersFound = L.icon({
    iconUrl: others_green,
    iconSize: [50, 50],
  });

  const othersDrag = L.icon({
    iconUrl: others_black,
    iconSize: [50, 50],
  });
  console.log(data);

  const allMarkers = data
    .filter((item) => {
      return search.toLowerCase() === "" ? item : item.name.toLowerCase().includes(search);
    })
    .filter((item) => {
      if (findFilter.isLost && item.isLost) {
        if (findFilter.type === "everything") {
          return item;
        } else if (findFilter.type === "headphone" && item.type === "headphone") {
          return item;
        } else if (findFilter.type === "phone" && item.type === "phone") {
          return item;
        } else if (findFilter.type === "key" && item.type === "key") {
          return item;
        } else if (findFilter.type === "wallet" && item.type === "wallet") {
          return item;
        } else if (findFilter.type === "others" && item.type === "others") {
          return item;
        }
      }
      if (findFilter.isFound && !item.isLost) {
        if (findFilter.type === "everything") {
          return item;
        } else if (findFilter.type === "headphone" && item.type === "headphone") {
          return item;
        } else if (findFilter.type === "phone" && item.type === "phone") {
          return item;
        } else if (findFilter.type === "key" && item.type === "key") {
          return item;
        } else if (findFilter.type === "wallet" && item.type === "wallet") {
          return item;
        } else if (findFilter.type === "others" && item.type === "others") {
          return item;
        }
      }
      return;
    })
    .filter((item) => {
      return findFilter.uploadDate === "" ? item : item.itemDate.includes(findFilter.uploadDate);
    })
    .map((item) => (
      <Marker
        position={item.location}
        eventHandlers={{
          click: () => {
            onOpen();
            setItemData(item);
          },
          mouseover: (event) => !isEdit && event.target.openPopup(),
        }}
        icon={
          item.type === "headphone" && item.isLost
            ? headphoneLost
            : item.type === "phone" && item.isLost
            ? phoneLost
            : item.type === "wallet" && item.isLost
            ? walletLost
            : item.type === "key" && item.isLost
            ? keyLost
            : item.type === "others" && item.isLost
            ? othersLost
            : item.type === "headphone" && !item.isLost
            ? headphoneFound
            : item.type === "phone" && !item.isLost
            ? phoneFound
            : item.type === "wallet" && !item.isLost
            ? walletFound
            : item.type === "key" && !item.isLost
            ? keyFound
            : item.type === "others" && !item.isLost
            ? othersFound
            : othersFound
        }
      >
        <Popup>{item.name}</Popup>
      </Marker>
    ));

  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  async function handleSubmit(image, type, name, description) {
    const date = new Date();

    const docRef = await addDoc(collection(db, "items"), {
      image: image,
      type: type,
      isLost: isLost,
      name: name,
      description: description,
      email: email,
      location: [position.lat, position.lng],
      itemDate: itemDate,
      date: date.toISOString(),
    });

    const newItem = {
      image: image,
      type: type,
      isLost: isLost,
      name: name,
      description: description,
      email: email,
      location: [position.lat, position.lng],
      date: date.toISOString(),
      itemDate: itemDate,
      id: docRef.id,
    };
    setData((prev) => [...prev, newItem]);
    setPosition(centerPosition);
  }

  const toggleDraggable = () => {
    handleSubmit(image, type, name, description);
    setIsEdit(!isEdit);
    setIsCreate(!isCreate);
  };

  return (
    <div>
      <MapContainer
        style={{
          height: "80vh",
          width: "90vw",
          borderRadius: "30px",
          zIndex: "0",
        }}
        center={centerPosition}
        zoom={17}
        zoomControl={false}
      >
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {!isEdit}
        {!isEdit && allMarkers}
        {isEdit && (
          <Marker className="marker" draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={othersDrag}>
            <Popup minWidth={90} closeButton={false}>
              <span className="popup" onClick={() => toggleDraggable()}>Click to Confirm Location 🤔</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <InfoModal props={itemData} onOpen={onOpen} onClose={onClose} isOpen={isOpen} currentEmail={email} setData={setData} />
    </div>
  );
}
