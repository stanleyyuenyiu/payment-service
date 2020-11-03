interface String {
    rtrim(s:string) : string;
    ltrim(s:string) : string;
    isNullOrEmpty() : boolean;
}
  

String.prototype.rtrim =  function( s: string) : string {
    if (s == undefined)
        s = '\\s';
    return this.replace(new RegExp("[" + s + "]*$"), '');
  };
  
String.prototype.ltrim = function(s: string): string {
    if (s == undefined)
      s = '\\s';
    return this.replace(new RegExp("^[" + s + "]*"), '');
  };

String.prototype.isNullOrEmpty = function() : boolean {
    if (this === undefined || this === null || this.trim() === '') {
        return true;
    }
    return false;
};
  