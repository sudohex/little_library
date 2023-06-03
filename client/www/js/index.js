/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    function onDeviceReady() {
        // Use the Fetch API to get the list of libraries from your server
        fetch('http://localhost:3000/api/libraries')
            .then(response => response.json())
            .then(libraries => {
                const libraryList = document.getElementById('library-list');
    
                // Create a list item for each library
                libraries.forEach(library => {
                    const li = document.createElement('li');
                    li.textContent = `${library.name}, ${library.address}`;
    
                    // Add a button to each list item
                    const btn = document.createElement('button');
                    btn.textContent = 'GO';
                    btn.addEventListener('click', () => {
                        // Navigate to the library
                        window.location.href = `http://localhost:3000/api/libraries/${library._id}`;
                    });
    
                    // Append the button to the list item, and the list item to the list
                    li.appendChild(btn);
                    libraryList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }
    
}
