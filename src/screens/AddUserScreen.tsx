import {
  ParticipantList,
  ParticipantListParticipant,
} from "@azure/communication-react";
import React, { useState, useEffect } from "react";
import { Stack } from "@fluentui/react";
import { useMsal } from "@azure/msal-react";
import RemoveUser from "../helper/RemoveUserGraphApi";

interface Props {
  chatthreadid: string;
  accesstokenarg: string;
}

interface UserEntity {
  domainname: string;
  fullname: string;
  internalemailaddress: string;
  systemuserid: string;
  // Add other properties as needed
}

const MembersScreen: React.FC<Props> = ({ chatthreadid, accesstokenarg }) => {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserEntity>();
  const [participants, setParticipants] = useState<
    ParticipantListParticipant[]
  >([]);

  function convertToParticipants(
    membersResponseJson: any
  ): ParticipantListParticipant[] {
    const participants: ParticipantListParticipant[] = [];
    for (const item of membersResponseJson) {
      participants.push({
        userId: item.userId,
        displayName: item.displayName,
        isRemovable: true,
      });
    }

    return participants;
  }

  async function FetchParticipants() {
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
      const participants = convertToParticipants(membersResponseJson.value);
      console.log(
        "FetchParticipants membersResponseJson --> ",
        membersResponseJson
      );
      console.log("participants membersResponseJson --> ", participants);
      setParticipants(participants);
    } catch (error) {
      console.log("FetchParticipants --> Autherror: ", error);
    }
  }

  const handletxtuserNameEmailTagChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("Change event:" + event);
    const { value } = event.target;
    setSearchTerm(value);
  };
  const handleUserSelection = (user: UserEntity) => {
    setSelectedUser(user);
    setSearchTerm("");
  };

  async function CERemoveUser(
    participantId: string | undefined,
    isLeave: boolean
  ) {
    console.log("CERemoveUser --> ", participantId);
    if (!isLeave) {
      const getCommunicationRecipientIdFetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
      <entity name="mzk_communicationrecipients">
        <attribute name="mzk_communicationrecipientsid" />
        <attribute name="mzk_communication" />
        <attribute name="mzk_user" />
        <link-entity name="systemuser" from="systemuserid" to="mzk_user">
        <attribute name="systemuserid" />
          <filter>
            <condition attribute="azureactivedirectoryobjectid" operator="eq" value="${participantId}" />
          </filter>
        </link-entity>
        <link-entity name="mzk_communication" from="activityid" to="mzk_communication">
          <filter>
            <condition attribute="mzk_chatthreadid" operator="eq" value="${chatthreadid}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>`;

      const communicationRecipients = await Xrm.WebApi.retrieveMultipleRecords(
        "mzk_communicationrecipients",
        getCommunicationRecipientIdFetchXml
      );
      console.log("communicationRecipients -->", communicationRecipients);
      const communicationRecipientsId = communicationRecipients.entities[0].mzk_communicationrecipientsid;
      const systemUserId = communicationRecipients.entities[0]["systemuser1.systemuserid"];
      
      console.log("communicationRecipients systemUserId --> ", systemUserId);

      const currentUserSystemIdFetchXML = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
      <entity name="systemuser">
        <attribute name="systemuserid" />
        <filter>
          <condition attribute="azureactivedirectoryobjectid" operator="eq" value="${activeAccount?.idTokenClaims?.oid}" />
        </filter>
      </entity>
    </fetch>`;

    const currentSystemUserObject = await Xrm.WebApi.retrieveMultipleRecords("systemuser", currentUserSystemIdFetchXML);
    const currentSystemUserId = currentSystemUserObject.entities[0].systemuserid;

      var entity = {
        mzk_recipientstatus: 275380002, //Removed
        "mzk_RemovedBy@odata.bind": `/systemusers(${currentSystemUserId})`,
      };

      const updatedCommunicationRecipientResponse = Xrm.WebApi.updateRecord(
        "mzk_communicationrecipients",
        communicationRecipientsId,
        entity
      );

      console.log(
        "updatedCommunicationRecipientResponse --> ",
        updatedCommunicationRecipientResponse
      );
    } else{
      const getCommunicationRecipientIdFetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
      <entity name="mzk_communicationrecipients">
        <attribute name="mzk_communicationrecipientsid" />
        <attribute name="mzk_communication" />
        <attribute name="mzk_user" />
        <link-entity name="systemuser" from="systemuserid" to="mzk_user">
        <attribute name="systemuserid" />
          <filter>
            <condition attribute="azureactivedirectoryobjectid" operator="eq" value="${participantId}" />
          </filter>
        </link-entity>
        <link-entity name="mzk_communication" from="activityid" to="mzk_communication">
          <filter>
            <condition attribute="mzk_chatthreadid" operator="eq" value="${chatthreadid}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>`;

      const communicationRecipients = await Xrm.WebApi.retrieveMultipleRecords(
        "mzk_communicationrecipients",
        getCommunicationRecipientIdFetchXml
      );
      console.log("communicationRecipients -->", communicationRecipients);
      const communicationRecipientsId =
        communicationRecipients.entities[0].mzk_communicationrecipientsid;
      const systemUserId =
        communicationRecipients.entities[0]["systemuser1.systemuserid"];
      console.log("communicationRecipients systemUserId --> ", systemUserId);

      var entity = {
        mzk_recipientstatus: 275380001, //Left
        "mzk_RemovedBy@odata.bind": `/systemusers(${systemUserId})`,
      };

      const updatedCommunicationRecipientResponse = Xrm.WebApi.updateRecord(
        "mzk_communicationrecipients",
        communicationRecipientsId,
        entity
      );

      console.log(
        "updatedCommunicationRecipientResponse --> ",
        updatedCommunicationRecipientResponse
      );
    }
  }

  async function RemoveParticipantClicked(
    participantId: string | undefined,
    isLeave: boolean
  ) {
    await CERemoveUser(participantId, isLeave);
    await RemoveUser(
      // accesstokenarg, 
      chatthreadid, participantId, isLeave);
    await FetchParticipants();
  }

  useEffect(() => {
    FetchParticipants();
  }, []);

  return (
    <Stack>
      <button
        onClick={() =>
          RemoveParticipantClicked(activeAccount?.idTokenClaims?.oid, true)
        }
      >
        Leave chat
      </button>
      <div
        style={{
          fontSize: "1.5rem",
          marginBottom: "1rem",
          fontFamily: "Segoe UI",
        }}
      >
        Participants
      </div>
      <ParticipantList
        participants={participants}
        myUserId={activeAccount?.idTokenClaims?.oid}
        onRemoveParticipant={(participantId) =>
          RemoveParticipantClicked(participantId, false)
        }
      />
    </Stack>
  );
};

export default MembersScreen;
