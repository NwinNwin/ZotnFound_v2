import React, { useState, useEffect } from "react";
import Map from "../Map/Map";
import "./Home.css";
import Filter from "../Filter/Filter";
import ResultsBar from "../ResultsBar/ResultsBar";
import { useNavigate } from "react-router-dom";
import CreateModal from "../CreateModal/CreateModal";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import instagram from "../../assets/logos/instagram.svg";
import { UserAuth } from "../../context/AuthContext";

import { SettingsIcon } from "@chakra-ui/icons";


import { Input, InputGroup, InputLeftAddon, Button, Flex, HStack, Text, Image, useDisclosure } from "@chakra-ui/react";
import logo from "../../assets/images/small_logo.png";
export default function Home() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const { user, logOut } = UserAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [findFilter, setFindFilter] = useState({
    type: "everything",
    isFound: true,
    isLost: true,
    uploadDate: "",
  });

  function formatDate() {
    var d = new Date(),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
  const [isEdit, setIsEdit] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [image, setImage] = useState("");
  const [type, setType] = useState("");
  const [isLost, setIsLost] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [itemDate, setItemDate] = useState(formatDate());
  const centerPosition = [33.6461, -117.8427];
  const [position, setPosition] = useState(centerPosition);
  const [focusLocation, setFocusLocation] = useState();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  const compareDates = (a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  };

  // Sort the array by date
  data.sort(compareDates);

  //get data
  useEffect(() => {
    const collectionRef = collection(db, "items");
    const getData = async () => {
      const querySnapshot = await query(collectionRef, orderBy("date"));
      const data = await getDocs(querySnapshot);
      setData(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getData();
  }, []);

  // console.log(findFilter);

  return (
    <div>
      <Flex justifyContent="space-between" shadow="md" alignItems="center">
        <Flex alignItems="center" w={{ base: "20%", md: "10%" }}>
          <Image width={{ base: "50px", md: "100px" }} src={logo} mb="5%" mt="3%" ml="10%" />
          <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="500">
            <a href="https://www.instagram.com/zotnfound/" target="_blank" rel="noreferrer">
              @zotnfound&nbsp;
            </a>
          </Text>
          <Image boxSize="30px" src={instagram} display={{ base: "none", md: "block" }} />
        </Flex>
        <HStack w={{ base: "100%", md: "40%" }} display={{ base: "none", md: "block" }}>
          <InputGroup ml={{ base: "5%", md: "12%" }} mt="1%" size={{ base: "md", md: "lg" }} mb="1%">
            <InputLeftAddon children="🔎" />
            <Input type="teal" placeholder="Search Items ..." onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
        </HStack>

        <HStack mr="1%">
          <Text fontSize={{ base: "sm", md: "xl" }} fontWeight="500" mr={{ base: "1%", md: "4%" }}>
            {user?.email}
          </Text>
          <Button colorScheme="blue" size={{ base: "sm", md: "lg" }} mt="2%" mr="5%" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* Mobile Search */}
      <Flex w="100%" display={{ base: "flex", md: "none" }} justifyContent="center" alignItems="center">
        <Flex width="95%">
          <InputGroup mt="3%" size={{ base: "md", md: "lg" }} mb="1%">
            <InputLeftAddon children="🔎" />
            <Input type="teal" placeholder="Search Items ..." onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
        </Flex>
      </Flex>
      <Flex position="relative" marginTop="2%" px="2%">
        {/* <CreateModal /> */}
        <Flex
          width={{ base: "95vw", md: "10vw" }}
          height={{ md: "80vh" }}
          padding={{ base: 0, md: 5 }}
          position="absolute"
          zIndex={1000}
          flexDirection={{ base: "row", md: "column" }}
          justifyContent="space-between"
        >
          <Button colorScheme="teal" onClick={onOpen} fontSize="3xl" size="lg">
            <SettingsIcon />
          </Button>
          <Filter setFindFilter={setFindFilter} findFilter={findFilter} onOpen={onOpen} isOpen={isOpen} onClose={onClose} />
          <CreateModal
            setImage={setImage}
            setDescription={setDescription}
            setIsLost={setIsLost}
            setName={setName}
            setType={setType}
            image={image}
            description={description}
            isLost={isLost}
            setIsCreate={setIsCreate}
            isCreate={isCreate}
            name={name}
            type={type}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            setPosition={setPosition}
            centerPosition={centerPosition}
            itemDate={itemDate}
            setItemDate={setItemDate}
          />
        </Flex>
        <Flex position="absolute">
          <Map
            data={data}
            isEdit={isEdit}
            isLost={isLost}
            type={type}
            image={image}
            description={description}
            name={name}
            email={user?.email}
            setIsEdit={setIsEdit}
            search={search}
            findFilter={findFilter}
            setIsLost={setIsLost}
            setData={setData}
            setIsCreate={setIsCreate}
            isCreate={isCreate}
            centerPosition={centerPosition}
            position={position}
            setPosition={setPosition}
            itemDate={itemDate}
            setItemDate={setItemDate}
            onOpen2={onOpen}
            focusLocation={focusLocation}
            setFocusLocation={setFocusLocation}
          />
        </Flex>
        <Flex position="absolute" top={0} right={5} display={{ base: "none", md: "flex" }}>
          <ResultsBar data={data} search={search} findFilter={findFilter} currentEmail={user?.email} setData={setData} setFocusLocation={setFocusLocation} />
        </Flex>
      </Flex>
    </div>
  );
}
