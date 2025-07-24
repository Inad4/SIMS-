const data = {
  "id": 1,
  "name": "string",
  "city": "string",
  "address": "string",
  "updatedAt": "2025-07-23T14:38:41.277Z",
  "createdAt": "2025-07-23T14:38:41.277Z",
  "users": [],
  "equipment": [
    {
      "id": 1,
      "name": "string",
      "room": 0,
      "pathToPhoto": "string",
      "status": 0,
      "type": "string",
      "serialNumber": "string",
      "schoolId": 1,
      "updatedAt": "2025-07-23T14:38:41.277Z",
      "createdAt": "2025-07-23T14:38:41.277Z",
      "requests": []
    }
  ]
}

const res = await fetch("http://localhost:5128/api/School", {
    method: "POST",
    body: JSON.stringify(data)
});

//const res = await fetch("http://localhost:5128/api/user/1");


if (!res.ok){
    console.error(`Error: ${res.statusText}(${res.status})`);
}else{
    const obj = await res.json();

    console.log(JSON.stringify(obj));
}

