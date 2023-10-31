async function DeleteMessage(
  messageid: string,
  chatthreadid: string,
  userid: any,
  accesstokenarg: string
) {
  try {
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ DeleteMessage messageid --> ",
      messageid
    );
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ DeleteMessage chatthreadid --> ",
      chatthreadid
    );
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ DeleteMessage userid --> ",
      userid
    );
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ DeleteMessage accesstokenarg --> ",
      accesstokenarg
    );

    const endpoint = `https://graph.microsoft.com/v1.0/users/${userid}/chats/${chatthreadid}/messages/${messageid}/softDelete`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accesstokenarg,
      },
    });

    if (!response.ok) {
      throw new Error(
        `DeleteMessage: Network response was not ok. Status: ${response.status}`
      );
    }

    const responseJson = await response.json();
    console.log("DeleteMessage response --> ", responseJson);
  } catch (error) {
    console.log("DeleteMessage Autherror: ", error);
  }
}

export default DeleteMessage;
