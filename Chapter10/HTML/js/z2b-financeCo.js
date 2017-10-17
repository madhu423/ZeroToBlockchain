/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// z2c-financeCo.js

var financeCOorderDiv = "financeCOorderDiv";
var orders = [];
const financeCoID = 'easymoney@easymoneyinc.com';
const financeCoName = 'The Global Financier';

/**
 * load the administration User Experience
 */
function loadFinanceCoUX ()
{
  toLoad = "financeCo.html";
  getPort();
  if (buyers.length === 0) 
  { $.when($.get(toLoad), $.get('/setup/getPort'), deferredSingleUX()).done(function (page, port, res)
  {setupFinanceCo(page[0], port[0]);});
}
  else{
    $.when($.get(toLoad), $.get('/setup/getPort')).done(function (page, port)
    {setupFinanceCo(page[0], port[0]);});
  }
}

function setupFinanceCo(page, port)
{
  $("#body").empty();
  $("#body").append(page);
  goMultiLingual("US_English", "financeCo");
  console.log('port is: '+port.port);
  msgPort = port.port;
  wsDisplay('finance_messages', msgPort);
  var _clear = $("#financeCOclear");
  var _list = $("#financeCOorderStatus");
  var _orderDiv = $("#"+financeCOorderDiv);
  _clear.on('click', function(){_orderDiv.empty();});
  _list.on('click', function(){listFinanceOrders()});
}
/**
 * lists all orders for the selected seller
 */
function listFinanceOrders()
{
  var options = {};
  options.id = financeCoID;
  $.when($.post('/composer/admin/getSecret', options)).done(function(_mem)
  {
    console.log(_mem);
    options.userID = _mem.userID; options.secret = _mem.secret;
    $.when($.post('/composer/client/getMyOrders', options)).done(function(_results)
      {
        console.log(_results.result);
        console.log(_results.orders);
        if (_results.orders.length < 1) {$("#"+financeCOorderDiv).empty(); $("#"+financeCOorderDiv).append(formatMessage('No orders for the financeCo: '+options.id));}
        else{orders = _results.orders; formatFinanceOrders($("#"+financeCOorderDiv), orders)}
      });
  });
}
/**
 * used by the listOrders() function
 * formats the orders for a buyer. Orders to be formatted are provided in the _orders array
 * output replaces the current contents of the html element identified by _target
 * @param _target - string with div id prefaced by #
 * @param _orders - array with order objects
 */
function formatFinanceOrders(_target, _orders)
{
  _target.empty();
  let _str = ""; let _date = ""; let p_string;
  for (let each in _orders)
  {(function(_idx, _arr)
    { _action = '<th><select id=f_action'+_idx+'><option value="NoAction">No Action</option>';
    p_string = '';
      switch (JSON.parse(_arr[_idx].status).code)
      {

        default:
        break;
      }
      _button = '<th><button id="f_btn_'+_idx+'">Execute</button></th>'
      _action += "</select>";
      if (_idx > 0) {_str += '<div class="spacer"></div>';}
      _str += '<div class="acc_header off" id="order'+_idx+'_h" target="order'+_idx+'_b"><table class="wide"><tr><th>Order #</th><th>Status</th><th class="right">Total</th><th colspan="3" class="right message">Buyer: '+findMember(_arr[_idx].buyer,buyers).companyName+'</th></tr>';
      _str += '<tr><th id ="f_order'+_idx+'" class="showFocus" width="20%">'+_arr[_idx].id+'</th><th width="50%">'+JSON.parse(_arr[_idx].status).text+': '+_date+'</th><th class="right">$'+_arr[_idx].amount+'.00</th>'+_action+'</th>'+_button+'</tr></table></div>';
      _str+= formatDetail(_idx, _arr[_idx]);
    })(each, _orders)
  }
  _target.append(_str);
  for (let each in _orders)
    {(function(_idx, _arr)
      { 
        $("#f_order"+_idx).on('click', function(){accToggle('financeCOorderDiv','order'+_idx+'_b', 'order'+_idx+'_h');});
        $("#order"+_idx+"_b").on('click', function(){accToggle('financeCOorderDiv','order'+_idx+'_b', 'order'+_idx+'_h');});
        $("#f_btn_"+_idx).on('click', function () 
        {
          var options = {};
          options.action = $("#f_action"+_idx).find(":selected").text();
          options.orderNo = $("#f_order"+_idx).text();
          options.participant = financeCoID;
          console.log(options);
          $("#finance_messages").prepend(formatMessage('Processing '+options.action+' request for order number: '+options.orderNo));
          $.when($.post('/composer/client/orderAction', options)).done(function (_results)
          { console.log(_results);
            $("#finance_messages").prepend(formatMessage(_results.result));
          });
      });
    })(each, _orders)
  }
}
/**
 * format the accordian with the details for this order
 */
function formatDetail(_cur, _order)
{
  console.log('['+_cur+'] is ',_order);
  var _out = '<div class="acc_body off" id="order'+_cur+'_b">';
  _out += '<h3 id="status">'+textPrompts.financeCoOrder.status+'\t'+JSON.parse(_order.status).text+'</h3>';
  _out += '<table class="wide"><tr><th id="action">'+textPrompts.financeCoOrder.status+'</th><th id="by">'+textPrompts.financeCoOrder.by+'</th><th id="date">'+textPrompts.financeCoOrder.date+'</th><th id="comments">'+textPrompts.financeCoOrder.comments+'</th></tr>';
  _out += '<tr><td id="created">Created</td><td>'+_order.buyer+'</td><td>'+_order.created+'</td><td></td></tr>';
  _out += (_order.cancelled === "") ?  '<tr><td id="cancelled">'+textPrompts.financeCoOrder.cancelled+'?</td><td></td><td id="notCancel">'+textPrompts.financeCoOrder.notCancel+'</td><td></td></tr>' : '<tr><td id="cancelled">'+textPrompts.financeCoOrder.cancelled+'</td><td>'+_order.buyer+'</td><td>'+_order.cancelled+'</td><td></td></tr>';
  _out += (_order.bought === "") ?  '<tr><td id="purchased">'+textPrompts.financeCoOrder.purchased+'</td><td></td><td id="noPurchase">'+textPrompts.financeCoOrder.noPurchase+'</td><td></td></tr>' : '<tr><td id="purchased">'+textPrompts.financeCoOrder.purchased+'</td><td>'+_order.buyer+'</td><td>'+_order.bought+'</td><td></td></tr>';
  _out += (_order.ordered === "") ?  '<tr><td id="thirdParty">'+textPrompts.financeCoOrder.thirdParty+'</td><td></td><td id="nothirdParty">'+textPrompts.financeCoOrder.nothirdParty+'</td><td></td></tr>' : '<tr><td id="thirdParty">'+textPrompts.financeCoOrder.thirdParty+'</td><td>'+_order.seller+'</td><td>'+_order.ordered+'</td><td></td></tr>';
  _out += (_order.dateBackordered === "") ?  '<tr><td id="backordered">'+textPrompts.financeCoOrder.backordered+'?</td><td></td><td id="notBackordered">'+textPrompts.financeCoOrder.notBackordered+'</td><td></td></tr>' : '<tr><td id="backordered">'+textPrompts.financeCoOrder.backordered+'</td><td>'+_order.provider+'</td><td>'+_order.dateBackordered+'</td><td>'+_order.backorder+'</td></tr>';
  _out += (_order.requestShipment === "") ?  '<tr><td id="shippingRequested">'+textPrompts.financeCoOrder.shippingRequested+'</td><td></td><td id="noRequestShip">'+textPrompts.financeCoOrder.noRequestShip+'</td><td></td></tr>' : '<tr><td id="shippingRequested">'+textPrompts.financeCoOrder.shippingRequested+'</td><td>'+_order.provider+'</td><td>'+_order.requestShipment+'</td><td></td></tr>';
  _out += (_order.delivering === "") ?  '<tr><td id="shippingStarted">'+textPrompts.financeCoOrder.shippingRequested+'</td><td></td><td id="noDeliveryStart">'+textPrompts.financeCoOrder.noDeliveryStart+'</td><td></td></tr>' : '<tr><td id="shippingStarted">'+textPrompts.financeCoOrder.shippingStarted+'</td><td>'+_order.shipper+'</td><td>'+_order.delivering+'</td><td></td></tr>';
  _out += (_order.delivered === "") ?  '<tr><td id="delivered">'+textPrompts.financeCoOrder.delivered+'</td><td></td><td id="notDelivered">'+textPrompts.financeCoOrder.notDelivered+'</td><td></td></tr>' : '<tr><td id="delivered">'+textPrompts.financeCoOrder.delivered+'</td><td>'+_order.shipper+'</td><td>'+_order.delivered+'</td><td></td></tr>';
  _out += (_order.paymentRequested === "") ?  '<tr><td id="payRequested">'+textPrompts.financeCoOrder.payRequested+'</td><td></td><td id="noRequest">'+textPrompts.financeCoOrder.noRequest+'</td><td></td></tr>' : '<tr><td id="payRequested">'+textPrompts.financeCoOrder.payRequested+'</td><td></td><td>'+_order.paymentRequested+'</td><td></td></tr>';
  _out += (_order.disputeOpened === "") ?  '<tr><td id="disputed">'+textPrompts.financeCoOrder.disputed+'</td><td></td><td id="noDispute">'+textPrompts.financeCoOrder.noDispute+'</td><td></td></tr>' : '<tr><td id="disputed">'+textPrompts.financeCoOrder.disputed+'</td><td>'+_order.buyer+'</td><td>'+_order.disputeOpened+'</td><td>'+_order.dispute+'</td></tr>';
  if (_order.disputeResolved === "")
  {
    if (_order.disputeOpened === "")
    {_out += '<tr><td>Dispute Resolved</td><td></td><td>not in dispute</td><td></td></tr>';}
    else
    {_out += '<tr><td>Dispute Resolved</td><td></td><td>Dispute is Unresolved</td><td></td></tr>';}
  }
  else
  {_out +='<tr><td>Dispute Resolved</td><td></td><td>'+_order.disputeResolved+'</td><td>'+_order.resolve+'</td></tr>';}
  _out += (_order.orderRefunded === "") ?  '<tr><td>Refund?</td><td></td><td>(No Refund in Process)</td><td></td></tr>' : '<tr><td>Refund?</td><td></td><td>'+_order.orderRefunded+'</td><td>'+_order.refund+'</td></tr>';
  _out += (_order.approved === "") ?  '<tr><td>Payment Approved</td><td></td><td>(No Approval from Buyer)</td><td></td></tr>' : '<tr><td>Payment Approved</td><td>'+_order.buyer+'</td><td>'+_order.approved+'</td><td></td></tr>';
  _out += (_order.paid === "") ?  '<tr><td>Paid</td><td></td><td>(UnPaid)</td><td></td></tr></table></div>' : '<tr><td>Paid</td><td>'+_order.financeCo+'</td><td>'+_order.paid+'</td><td></td></tr></table></div>';
  return _out;
}
