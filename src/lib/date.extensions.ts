interface Date {
    toISOStringWTimeZone(timezoneoffset:number) : string;
}

Date.prototype.toISOStringWTimeZone = function(timezoneoffset: number): string {
    var d = this;
    d.setHours(d.getUTCHours()+ timezoneoffset);
    let dDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2) ].join('-');
    let dTime = [('0' + d.getHours()).slice(-2), ('0' + d.getMinutes()).slice(-2), ('0' + d.getSeconds()).slice(-2)].join(':');
    return `${dDate}T${dTime}${timezoneoffset >= 0 ? "+" : "-"}${(timezoneoffset.toString().padStart(2,"0").padEnd(4, "0"))}`;
 };

  