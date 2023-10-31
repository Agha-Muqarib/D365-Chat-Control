async function RemoveUser(
  // accesstokenarg: string,
  chatthreadid: string,
  userId: string | null | undefined,
  isLeave: boolean
) {
  const accesstokenarg = sessionStorage.getItem('userAccessToken');
  console.log("RemoveUser accesstokenarg sessionStorage --> ", accesstokenarg);
  async function GetAADId() {
    if (userId) {
      const result = await Xrm.WebApi.retrieveRecord(
        "systemuser",
        userId,
        "?$select=azureactivedirectoryobjectid"
      );
      console.log(
        "RemoveUser GetAADId result.azureactivedirectoryobjectid --> ",
        result.azureactivedirectoryobjectid
      );
      return result.azureactivedirectoryobjectid;
    }
    return;
  }

  console.log("inside RemoveUser accesstokenarg --> ", accesstokenarg);
  console.log("inside RemoveUser chatthreadid --> ", chatthreadid);
  console.log("inside RemoveUser userId --> ", userId);
  console.log("inside RemoveUser isLeave --> ", isLeave);
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
        `RemoveUser: Network response was not ok. Status: ${memebersResponse.status}`
      );
    }

    const membersResponseJson = await memebersResponse.json();
    console.log("RemoveUser membersResponseJson --> ", membersResponseJson);

    if (isLeave) {
      console.log("RemoveUser: inside if isLeave true");
      let membersList = [];
      let memberId = "";
      membersList = membersResponseJson.value;

      for (const item of membersList) {
        const aadId = userId;
        if (item.userId === aadId) {
          memberId = item.id;
          break; // Assuming you only need one matching member
        }
      }

    //   console.log("RemoveUser membersList --> ", membersList);
    //   let memberIdObj = membersList
    //     .filter(async (item: { userId: string }) => {
    //       //   const aadId = await GetAADId();
    //       return item.userId === userId;
    //     })
    //     .map((item: { id: string }) => item.id);
    //   let memberId = memberIdObj[0];
    //   console.log("RemoveUser memberIdObj --> ", memberIdObj);

      const removeUserEndpoint = `https://graph.microsoft.com/v1.0/chats/${chatthreadid}/members/${memberId}`;
      const removedUser = await fetch(removeUserEndpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ` + accesstokenarg,
          "Content-Type": "application/json",
        },
      });
      console.log("removedUser response: ", removedUser);
    } else {
      console.log("RemoveUser: inside else isLeave false");
      let membersList = [];
      let memberId = "";
      membersList = membersResponseJson.value;

      console.log("RemoveUser membersList --> ", membersList);
    //   const removeUserMemmebrId = membersList.find(
    //     (val: { userId: string | null | undefined }) => val.userId === userId
    //   );
    //   if (removeUserMemmebrId) {
    //     memberId = removeUserMemmebrId.id;
    //   }
      for (const item of membersList) {
        const aadId = await GetAADId();
        if (item.userId === aadId) {
          memberId = item.id;
          break; // Assuming you only need one matching member
        }
      }
      //   let memberIdObj = membersList
      //     .filter(async (item: { userId: string }) => {
      //       const aadId = await GetAADId();
      //       return item.userId === aadId;
      //     })
      //     .map((item: { id: string }) => item.id);
      //   let memberId = memberIdObj[0];

      //   console.log("RemoveUser memberIdObj --> ", memberIdObj);

      console.log("RemoveUser Member Id:", memberId);

      const removeUserEndpoint = `https://graph.microsoft.com/v1.0/chats/${chatthreadid}/members/${memberId}`;
      const removedUser = await fetch(removeUserEndpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ` + accesstokenarg,
          "Content-Type": "application/json",
        },
      });
      console.log("removedUser response: ", removedUser);
    }
  } catch (error) {
    console.log("RemoveUser --> Autherror: ", error);
  }
}

export default RemoveUser;
