var begin = require('../')

require('../test')("Nested transactions", function (conn, t) {
  t.plan(2)
  conn.query("DROP TABLE transaction_test", function (err) {})
  conn.query("CREATE TABLE transaction_test (a int)")

  var tx1 = begin(conn)
  tx1.query('INSERT INTO transaction_test (a) VALUES (1)')

  begin(tx1, function(err, tx2){
    if (err) throw err
    tx2.query('INSERT INTO transaction_test (a) VALUES (2)')

    tx2.query('SELECT * FROM transaction_test', function (err, res) {
      if (err) throw err
      t.deepEqual(res.rows, [{a: 1}, {a: 2}])

      tx2.rollback(function(err){
        if (err) throw err
        tx1.commit(function(err){
          if (err) throw err
          conn.query('SELECT * FROM transaction_test', function (err, res) {
            if (err) throw err
            t.deepEqual(res.rows, [{a: 1}])
          })
        })
      })
    })
  })
})
