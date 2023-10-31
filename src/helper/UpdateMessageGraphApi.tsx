async function UpdateMessage(
  messageid: string,
  content: string,
  chatthreadid: string,
  accesstokenarg: string
) {
  try {
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ UpdateMessage messageid --> ",
      messageid
    );
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ UpdateMessage content --> ",
      content
    );
    console.log(
        "``````````````~~~~~~~~~~~~~~~~~ UpdateMessage chatthreadid --> ",
        chatthreadid
      );
    console.log(
      "``````````````~~~~~~~~~~~~~~~~~ UpdateMessage accesstokenarg --> ",
      accesstokenarg
    );
    const endpoint = `https://graph.microsoft.com/v1.0//chats/${chatthreadid}/messages/${messageid}`;
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + accesstokenarg,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: {
          content: content
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `UpdateMessage: Network response was not ok. Status: ${response.status}`
      );
    }

    const responseJson = await response.json();
    console.log("UpdateMessage response --> ", responseJson);
  } catch (error) {
    console.log("UpdateMessage Autherror: ", error);
  }
}

export default UpdateMessage;
