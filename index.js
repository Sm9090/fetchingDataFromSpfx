console.log("Hello from jsCdn and fetching user detail");

// Function to get the form digest value for CSRF protection
async function getRequestDigest(webUrl) {
  try {
    const response = await fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose"
      }
    });
    if (!response.ok) {
      throw new Error("Failed to get request digest: " + response.statusText);
    }
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  } catch (error) {
    console.error("Error getting request digest:", error);
    throw error;
  }
}

// Main function to create or update a list and add user details
async function createOrUpdateListAndAddItem(webUrl, listName) {
  try {
    // Step 1: Get the request digest value
    const requestDigestValue = await getRequestDigest(webUrl);

    // Step 2: Fetch current user details
    const userResponse = await fetch(`${webUrl}/_api/web/currentUser`, {
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      credentials: "same-origin"
    });

    if (!userResponse.ok) {
      throw new Error("Error fetching user details: " + userResponse.statusText);
    }

    const userData = await userResponse.json();
    const user = userData.d;

    console.log(user, 'User details fetched');

    // Step 3: Check if the list exists
    let response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')`, {
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      credentials: "same-origin"
    });

    console.log(webUrl ," weburl")
    if (response.status === 404) {
      console.log("List not found, creating it...");

      response = await fetch(`${webUrl}/_api/web/lists`, {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json",
          "X-RequestDigest": requestDigestValue
        },
        body: JSON.stringify({
          // '__metadata': { 'type': 'SP.List' },
          'Title': listName,
          'BaseTemplate': 100 // Custom list type
        }),
        credentials: "same-origin"
      });

      if (!response.ok) {
        throw new Error("Error creating list: " + response.statusText);
      }
      console.log(response , "response")

      console.log("List created successfully.");

      // Step 4: Create columns in the list
      const columns = ['Email', 'UserID', 'Username', 'AddedOn'];
      for (const column of columns) {
        const columnResponse = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/Fields`, {
          method: "POST",
          headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json",
            "X-RequestDigest": requestDigestValue
          },
          body: JSON.stringify({
            '__metadata': { 'type': 'SP.Field' },
            'Title': column,
            'FieldTypeKind': 2, // Single line of text
            'Required': false
          }),
          credentials: "same-origin"
        });
      
        const columnResult = await columnResponse.json();
        console.log(`Column ${column} creation response:`, columnResult);
      
        if (!columnResponse.ok) {
          console.error(`Failed to create column ${column}:`, columnResult.error.message);
        }
      }
      // console.log(response ,"response")
      console.log("Columns created successfully.");
    } else {
      console.log("List exists.");
    }

    // Step 5: Add an item with user details
    const addItemResponse = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json",
        "X-RequestDigest": requestDigestValue
      },
      body: JSON.stringify({
        '__metadata': { 'type': 'SP.Data.UserListItem' },
        'Title': user.Title,
        'Email': user.Email,
        'UserID': user.Id,
        'Username': user.LoginName,
        'AddedOn': new Date().toISOString()
      }),
      credentials: "same-origin"
    });

    if (!addItemResponse.ok) {
      throw new Error("Error adding item: " + addItemResponse.statusText);
    }

    console.log("User detail added successfully.");
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

// Expose the function to the global window object
window.createOrUpdateListAndAddItem = createOrUpdateListAndAddItem;
