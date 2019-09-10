var oFileIn;

$(function () {
    oFileIn = document.getElementById('my_file_input');
    if (oFileIn.addEventListener) {
        oFileIn.addEventListener('change', filePicked, false);
    }
});


function filePicked(oEvent) {
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    var reader = new FileReader();

    reader.onload = function (e) {
        var data = e.target.result;
        var cfb = XLSX.read(data, { type: 'binary' });

        cfb.SheetNames.forEach(async function (sheetName) {
            try {
                var sCSV = XLS.utils.make_csv(cfb.Sheets[sheetName]);
                var ojs = await XLS.utils.sheet_to_json(cfb.Sheets[sheetName]);

                for (let i = 25; i < 30; i++) {

                    const fname = (ojs[i].Firstname).replace("-fn ", "").trim();
                    const minit = (ojs[i].MiddleInitial).replace("-mi ", "").trim();
                    const lname = ojs[i].LASTNAME;
                    const username = ojs[i].USERNAMES;
                    let department = ojs[i].Department;

                    if (!department) department = 'ND';

                    const body = {
                        username: username,
                        fname: fname,
                        minit: minit,
                        lname: lname,
                        department: department
                    }

                    fetch('/API/user/insert', {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .then(res => res.json())
                        .then(data => {

                        })
                        .catch(err => {
                            console.log(err);
                        });

                }

            } catch (err) {
                console.log(err);
            }
        });
    };

    reader.readAsBinaryString(oFile);
}