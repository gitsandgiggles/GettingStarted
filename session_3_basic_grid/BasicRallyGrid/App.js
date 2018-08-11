// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

    myStore: undefined,
    myGrid: undefined,
    
    // Entry Point to App
    launch: function() {

      console.log('our second app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      //this._loadData();                 // we need to prefix with 'this.' so we call a method found at the app level.
      
      this.pulldownContainer = Ext.create('Ext.container.Container', {
          layout: {
                    type: 'hbox',
                    align: 'stretch'
          }
      });
      
      this.add(this.pulldownContainer);
      this._loadIterations();
   },

   _loadIterations: function() {
      this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox',{
          fieldLabel: 'Iteration',
          labelAlign: 'right',
          width: 500,
          listeners: {
             ready: function(combobox){
                 //this._loadData();  
                 this._loadSeverities();
             },
             select: function(combobox, records){
                 this._loadData();  
             },
             scope: this
          }
      });
      this.pulldownContainer.add(this.iterComboBox);
   
   },
   
   _loadSeverities: function(){
       this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
          fieldLabel: 'Severity',
          labelAlign: 'right',
          model: 'Defect',
          field: 'Severity',
          listeners: {
             ready: function(combobox){
                 this._loadData();  
             },
             select: function(combobox, records){
                 this._loadData();  
             },
             scope: this
          }
       });
       
       this.pulldownContainer.add(this.severityComboBox);
   },
   
    // Get data from Rally
    _loadData: function() {
      
      var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
      var selectedSeverityValue = this.severityComboBox.getRecord().get('value');
      
      console.log('selected severity', selectedSeverityValue);
      console.log('selected iter', selectedIterRef);  

      var myFilters = [
        {
          property: 'Iteration',
          operation: '=',
          value: selectedIterRef
        },
        {
          property: 'Severity',
          operation: '=',
          value: selectedSeverityValue
        }    
      ];

      // if store exists load new data 
      if (this.defectStore) {
        console.log('store exists');
        
        this.defectStore.setFilter(myFilters);
        this.defectStore.load();
        
      } else {
              console.log('creatng store');
      // create store
      
        this.defectStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'Defect',
            autoLoad: true,                         // <----- Don't forget to set this to true! heh
            filters: myFilters,
            listeners: {
                load: function(myStore, myData, success) {
                    console.log('got data!', myStore, myData);
                    
                    if (!this.myGrid){
                      this._createGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
                    }
                },
                scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
            },
            fetch: ['FormattedID', 'Name', 'severity', 'Iteration']   // Look in the WSAPI docs online to see all fields available!
          });
      }
    },

    // Create and Show a Grid of given stories
    _createGrid: function(myStoryStore) {

      this.myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'severity', 'Iteration'
        ]
      });

      this.add(this.myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

      //console.log('what is this?', this);

    }

});
