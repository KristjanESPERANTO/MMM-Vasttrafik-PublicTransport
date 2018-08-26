/* MMM-Vasttrafik-PublicTransport.js - DRAFT
 *
 * Magic Mirror module - Display public transport depature board for V�sttrafik/Sweden. 
 * This module use the API's provided by V�sttrafik (https://developer.vasttrafik.se).
 * 
 * Magic Mirror
 * Module: MMM-Vasttrafik-PublicTransport
 * 
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 * 
 * Module MMM-Vasttrafik-PublicTransport By Bure R�man Vinn�
 * 
 */

Module.register("MMM-Vasttrafik-PublicTransport", {

    // Default module config.
    defaults: {
        stopId: "9021014007270000",
        appKey: "",
        appSecret: "",
        debug: false
    },

    getScripts: function () {
        return ["moment.js"];
    },

    getHeader: function () {
        var stopId = this.config.stopId;
        return this.data.header + " " + stopId;
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.updateDom();

        //Send config to node_helper
        Log.info("Send configs to node_helper..");
        this.sendSocketNotification("CONFIG", this.config);
        var self = this;
    },

    getDom: function () {
        Log.info("getDom triggered");
        var wrapper = document.createElement("div");
        wrapper.style = "width: 100%;min-width: 268px;max-width:500px; max-height: 100%;background-color: #3c4550;display: flex;flex-direction: column;"
        if (!this.loaded && !this.failure) {
            wrapper.innerHTML = "<img src='http://seekvectorlogo.com/wp-content/uploads/2018/07/vasttrafik-ab-vector-logo-small.png'></img>"
            return wrapper;
        }
        if (this.failure) {
            wrapper.innerHTML = "Connection to V�sttrafik failed. Please review logs";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        var table = document.createElement("table");
        table.className = "xsmall";

        if (this.stop) {

            if (this.stop) {
                var row = document.createElement("tr");
                var th = document.createElement("th");
                th.innerText = this.stop.serverDatetime + ", " + this.stop.name;
                th.className = 'align-left';
                row.appendChild(th);
                table.appendChild(row);
            }


            var row = document.createElement("tr");
            var th = document.createElement("th");
            th.innerHTML = "Linje&nbsp;"
            th.className = 'align-left';
            row.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "Destination"
            th.className = 'align-left';
            row.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "L�ge"
            th.className = 'align-left';
            row.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "N�sta"
            row.appendChild(th);
            row.appendChild(th);
            th = document.createElement("th");
            th.innerHTML = "D�refter"
            row.appendChild(th);
            table.appendChild(row);
            for (var i = 0; i < this.stop.lines.length; i++) {
                var line = this.stop.lines[i];
                var row = document.createElement("tr");
                var td = document.createElement("td");
                td.style = "text-align: center; width: 60px; padding-right: 2px;";
                var span = document.createElement("span");
                span.style = "color:" + line.color + ";background-color:" + line.bgColor;
                span.textContent = line.line;
                td.appendChild(span);
                row.appendChild(td);
                var td = document.createElement("td");
                td.innerHTML = line.direction;
                row.appendChild(td);
                var td = document.createElement("td");
                td.innerHTML = line.track;
                row.appendChild(td);
                var td = document.createElement("td");
                td.innerHTML = line.departureIn;
                row.appendChild(td);
                var td = document.createElement("td");
                td.innerHTML = line.nextDeparture;
                row.appendChild(td);
                table.appendChild(row);
            };
            wrapper.appendChild(table);
            return wrapper;
        }
    },

    // --------------------------------------- Handle socketnotifications
    socketNotificationReceived: function (notification, payload) {
        Log.info("socketNotificationReceived: " + notification + ", payload: " + payload);
        if (notification === "STOPS") {
            this.loaded = true;
            this.failure = undefined;
            // Handle payload
            this.stop = payload;
            this.updateDom();
        }
        else if (notification == "SERVICE_FAILURE") {
            this.loaded = true;
            this.failure = payload;
            Log.info("Service failure: " + this.failure.resp.StatusCode + ':' + this.failure.resp.Message);
            this.updateDom();
        }
    }
});