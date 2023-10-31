async function FetchParticipants(chatthreadid: string) {
  const accesstokenarg = sessionStorage.getItem("userAccessToken");
  console.log("inside FetchParticipants accesstokenarg --> ", accesstokenarg);
  console.log("inside FetchParticipants chatthreadid --> ", chatthreadid);
  try {
    const endpoint =
      `https://graph.microsoft.com/v1.0/chats/` + chatthreadid + `/members`;
    const memebersResponse = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accesstokenarg,
        "Content-Type": "application/json",
      },
    });

    if (!memebersResponse.ok) {
      throw new Error(
        `FetchParticipants: Network response was not ok. Status: ${memebersResponse.status}`
      );
    }

    const membersResponseJson = await memebersResponse.json();
    console.log(
      "FetchParticipants membersResponseJson --> ",
      membersResponseJson
    );
    console.log(
      "FetchParticipants membersResponseJson.value --> ",
      membersResponseJson.value
    );
    return membersResponseJson.value;
  } catch (error) {
    console.log("FetchParticipants --> Autherror: ", error);
    return [];
  }
}

export default FetchParticipants;
