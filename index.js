console.log("Hello from jsCdn and fetching user detail");

async function createOrUpdateListAndAddItem(webUrl, listName) {
  try {
    // Step 1: Fetch current user details
    const userResponse = await fetch(`${webUrl}/_api/web/currentUser`, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Error fetching user details: " + userResponse.statusText);
    }

    const userData = await userResponse.json();
    const user = userData.d;

    console.log(user, 'user');

    // Step 2: Check if the list exists
    let response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json;odata=verbose'
      }
    });

    // If the list doesn't exist, create it
    if (!response.ok && response.status === 404) {
      console.log("List not found, creating it...");
      const requestDigestValue = document.getElementById("__REQUESTDIGEST")
      console.log(requestDigestValue , "requestDigestValue")
      response = await fetch(`${webUrl}/sites/Communication%20Site/_api/web/lists`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json',
          'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6IkxSZ0VrbDBvYTJXa3dLdFVIOVg3RVJhdURYaHRGQ3JvMU9hZjZ3ZzVtYXciLCJhbGciOiJSUzI1NiIsIng1dCI6IjNQYUs0RWZ5Qk5RdTNDdGpZc2EzWW1oUTVFMCIsImtpZCI6IjNQYUs0RWZ5Qk5RdTNDdGpZc2EzWW1oUTVFMCJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83NmRjNTBiOC01ZDdiLTQzMTYtYTJmZC04YTFjY2IwYWMwNDQvIiwiaWF0IjoxNzMwNzQxMjMzLCJuYmYiOjE3MzA3NDEyMzMsImV4cCI6MTczMDc0NjY4MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhZQUFBQU85b0hUSm1tQW9XaGpJWE9RWTI0TytNb2RTMU91SCtLTHpnbWxKcE52aGFDZzRDWHdLZW1abG4xQ21UQW9BZ1kiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6Ik9mZmljZTM2NSBTaGVsbCBXQ1NTLUNsaWVudCIsImFwcGlkIjoiODliZWUxZjctNWU2ZS00ZDhhLTlmM2QtZWNkNjAxMjU5ZGE3IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJBbnNhcmkiLCJnaXZlbl9uYW1lIjoiSGFtcyBBaG1lZCIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjExOS43My45Ni43NSIsIm5hbWUiOiJIYW1zIEFobWVkIEFuc2FyaSIsIm9pZCI6IjUzNDM4MmU5LWNhMDMtNDkyNi04N2FhLTMxNGIyN2M0Y2VhYiIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwM0M5RTdEODc0IiwicmgiOiIxLkFXTUJ1RkRjZG50ZEZrT2lfWW9jeXdyQVJBTUFBQUFBQUFBQXdBQUFBQUFBQUFCakFhSmpBUS4iLCJzY3AiOiJlbWFpbCBGaWxlcy5SZWFkV3JpdGUgb3BlbmlkIHByb2ZpbGUgVXNlci5SZWFkV3JpdGUiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJPQ2xyVnh4S3RPbmxueHFCbGl1SmZDa0g1MkdFVWR5ZFpqQmR0QXlVVnBrIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiNzZkYzUwYjgtNWQ3Yi00MzE2LWEyZmQtOGExY2NiMGFjMDQ0IiwidW5pcXVlX25hbWUiOiJhZG1pbkAzdmtnbmYub25taWNyb3NvZnQuY29tIiwidXBuIjoiYWRtaW5AM3ZrZ25mLm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6ImhDQ2RYSEdUeDBHc2t3MG92MTk5QUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCIsImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfaWRyZWwiOiI0IDEiLCJ4bXNfc3QiOnsic3ViIjoib1FVMExVRFNSdl9iUEp0eG04S1dxajJFcTZFN2JQX0Z6cEVyQmdrYnZkRSJ9LCJ4bXNfdGNkdCI6MTcyNjAwMzI5OX0.Yd5BNbCR9oc5MpX_jcb119zUvvncudLfYqwaSblVc64i47FQmaUtoKWS7xN0LSIznfAcchZe8jNK2n6w-L4iyJsq8dVPD70rinHKtgxU7xO_LqUD5QlagLnkhOMpInrGVw54X7Y69kk38e_OW9mw8V8kxPwL9bAKcRZ8sOlh5IQm2PI67fk9MX8fALCJGR4Eylq6xa8kVlfwDm03dznFUYZO-W-nLEVPI2NGlrX3bBHe6lSmL64K0TFBmOcPY4AK36RHa_0a9YWwCEBMa99oGxYCBsNvY_U4D7Yv6jbKNz5ogxq1PiGktg4JRwUwXhpiYc0i0vbwyW5djw8NQg5q0w" 
        },
        body: JSON.stringify({
          '__metadata': { 'type': 'SP.List' },
          'Title': listName,
          'BaseTemplate': 100 // Custom list type
        })
      });
      console.log("1")

      if (!response.ok) {
        throw new Error("Error creating list: " + response.statusText);
      }

      console.log(response , 'response')

      console.log("List created successfully.");

      // Step 3: Create columns in the list
      const columns = ['Email', 'UserID', 'Username', 'AddedOn'];
      for (const column of columns) {
        await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/Fields`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json',
            'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
          },
          body: JSON.stringify({
            '__metadata': { 'type': 'SP.Field' },
            'Title': column,
            'FieldTypeKind': 2, // Single line of text
            'Required': false
          })
        });
      }
      console.log("Columns created successfully.");
    } else {
      console.log("List exists.");
    }
console.log("2")
    // Step 4: Add an item with user details
    const addItemResponse = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json',
        'X-RequestDigest': document.getElementById("__REQUESTDIGEST").value
      },
      body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.UserListItem' },
        'Title': user.Title, // Using the user name as the Title
        'Email': user.Email,
        'UserID': user.Id,
        'Username': user.LoginName,
        'AddedOn': new Date().toISOString()
      })
    });

    console.log("3")
    if (!addItemResponse.ok) {
      throw new Error("Error adding item: " + addItemResponse.statusText);
    }

    console.log("4")
    console.log("User detail added successfully.");
  } catch (error) {
    console.error("something went wrong");
  }
}

window.createOrUpdateListAndAddItem = createOrUpdateListAndAddItem;
