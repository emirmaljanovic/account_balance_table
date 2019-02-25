(function(){
    'use strict';
    var accountInfo = {};
    var nameDOM = $('#account_name');
    var ibanDOM = $('#account_iban');
    var currencyDOM = $('#currency');
    var unavailableDOM = $('#unavailable');
    var balanceDOM = $('#account_balance');
    var debitCreditListDOM = $('#debit_credit_list');

    getAccountData();

    function getAccountData() {
        $.get('/api/getbalance')
            .then(function(response){
                accountInfo = response;
                populateData(accountInfo);
            }, function(err){
                unavailableDOM.css('display', 'flex');
            });
    }

    /**
     * Takes data from param, and adds it with .html() to appropriate DOM elements.
     * Also, iterating through debit and credit data in order to populate the list.
     * @param {Object} data - Data (from server) that needs to be displayed
     */
    function populateData(data) {
        nameDOM.html(data.account.name);
        balanceDOM.html(data.account.balance);
        ibanDOM.html(data.account.iban);
        currencyDOM.html(data.currency);

        data.debitsAndCredits.forEach(function(debit_credit_item){
            debitCreditListDOM.append(makeListItem(debit_credit_item));
        });
    }

    /**
     * This function calls for formatDate() in order to get 'dd-MM-yyyy' date format.
     * It also checks if the item is debit or credit, and according to that information
     * sets list row background color (class = "debit" or class = "credit").
     * Lastly, it uses isDebit information to detect where to read amount info from.
     * @param {Object} item - One object in debit/credit array.
     * @return {String} domString - html string of one list item
     */
    function makeListItem(item) {
        item.date = formatDate(item.date);
        var isDebit = item.hasOwnProperty('to') ? true : false;
        var debitCreditVal = isDebit ? item.to : item.from;
        var amountVal = item.hasOwnProperty('debit') ? item.debit : item.amount;

        var domString = 
            '<div class = "debit-credit-list__item ' + (isDebit ? 'debit' : 'credit') + '">' +
                '<div class = "item-block">' +
                    '<label>' + (isDebit ? 'To:' : 'From:') + '</label>' +
                    '<span class = "value">' + debitCreditVal + '</span>' +
                '</div>' +
                '<div class = "item-block">' +
                    '<label>Date:</label>' +
                    '<span class = "value">' + item.date +'</span>' +
                '</div>' +
                '<div class = "item-block">' +
                    '<label>Amount:</label>' +
                    '<span class = "value">' + amountVal + '</span>' +
                '</div>' +
                '<div class = "item-block item-block--full">' +
                    '<label>Description:</label>' +
                    '<p class = "value">' + item.description + '</p>' +
                '</div>' +
            '</div>';

        return domString;
    }

    /**
     * Takes Date string from param, makes new Date JS object from it, and
     * ultimately returns 'dd-MM-yyyy' format back
     * @param {String} provided_date - Date string to be formated
     * @return {String} formated_date
     */
    function formatDate(provided_date) {
        var date = new Date(provided_date);

        return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    }
})();