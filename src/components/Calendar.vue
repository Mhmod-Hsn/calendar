<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn color="primary" dark class="mx-4" @click="dialog= true">
            New event
          </v-btn>
          <v-btn outlined @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next" class="mr-5">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn
                outlined
                v-on="on"
                >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <!-- Add Event Dialog -->
      <v-dialog v-model="dialog" max-width="500">
          <v-card>
              <v-container>
                  <v-form @submit.prevent="addEvent">
                      <v-text-field v-model="name" type="text" label="Event Name (required)">
                      </v-text-field>
                      <v-text-field v-model="details" type="text" label="details">
                      </v-text-field>
                      <v-row >
                          <v-col md='6'>
                            <input 
                            title="Enter Start Date"
                            pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))" 
                            v-model="start" type="date" label="start">
                          </v-col>
                          
                          <v-col md='6'>
                            <input 
                            title="Enter Start Time"
                            v-model="startTime" type="time" label="start">
                          </v-col>
                      </v-row>

                      <v-row >
                          <v-col md='6'>
                            <input 
                            title="Enter End Date"
                            pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))" 
                            v-model="end" type="date" label="end">
                          </v-col>
                          
                          <v-col md='6'>
                            <input 
                            title="Enter End Date"
                            v-model="endTime" type="time" label="end">
                          </v-col>
                      </v-row>

                      <v-text-field v-model="color" type="color" label="color">
                      </v-text-field>
                      <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog=false">
                            Create Event
                      </v-btn>
                  </v-form>
              </v-container>
          </v-card>
      </v-dialog>


      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
          
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn @click="deleteEvent(selectedEvent.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <form v-if="currentlyEditing !== selectedEvent.id">
                  {{selectedEvent.details}}
              </form>
              <form v-else>
                  <textarea-autosize
                  v-model="selectedEvent.details"
                  type="text"
                  style="width:100%"
                  :min-height='100'
                  placeholder='Add Note'
                  ></textarea-autosize>
              </form>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Close
              </v-btn>
              <v-btn
                text
                v-if="currentlyEditing !== selectedEvent.id"
                @click.prevent="editEvent(selectedEvent)">
                Edit
              </v-btn>
              <v-btn
                text
                v-else
                @click.prevent="updateEvent(selectedEvent)">
                Update Event
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>


<script>
    import {db} from '@/main'

    export default {
        name: "Calendar",
        data: () => ({
            today: new Date().toISOString().substr(0,10),
            focus: new Date().toISOString().substr(0,10),
            type: 'month',
            typeToLabel:{
                month: 'Month',
                week: 'Week',
                day: 'Day',
                '4day': '4 Days'
            },
            name: null,
            details: null,
            start: null,
            startTime: null,
            end: null,
            endTime: null,
            color: '#1976D2',
            currentlyEditing: null,
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            events:[],
            dialog: false
        }),
        mounted(){
            this.getEvents()
        },
        methods:{
            async getEvents() {
                    let snapshot = await db.collection('calEvent').get();
                    let events = [];
                    snapshot.forEach(doc => {
                        let appData = doc.data()
                        appData.id = doc.id
                        events.push(appData)
                    });
                    this.events = events
                },
                async addEvent(){
                    if(this.name && this.start && this.end){
                        await db.collection('calEvent').add({
                            name: this.name,
                            details: this.details,
                            start: this.start+' '+this.startTime,
                            end: this.end+' '+this.endTime,
                            color: this.color
                        })
                    this.getEvents();
                    this.name= ''
                    this.details= ''
                    this.start= ''
                    this.end= ''
                    this.startTime= ''
                    this.endTime= ''
                    this.color= '#1976D2'

                    }else{
                        alert('Name, start and end date is required!')
                    }
                },

                async updateEvent(ev){
                    await db.collection('calEvent').doc(this.currentlyEditing).update({
                        details: ev.details
                    })
                    this.selectedOpen = false
                    this.currentlyEditing = null
                },
                async deleteEvent(ev){
                    await db.collection('calEvent').doc(ev).delete()
                    this.selectedOpen = false
                    this.getEvents()
                },
                getEventColor(ev) {
                    return ev.color;
                },
                viewDay({
                    date
                }) {
                    this.focus = date
                    this.type = 'day'
                },
                setToday() {
                    this.focus = this.today
                },
                prev() {
                    this.$refs.calendar.prev()
                },
                next() {
                    this.$refs.calendar.next()
                },
                showEvent({
                    nativeEvent,
                    event
                }) {
                    const open = () => {
                        this.selectedEvent = event
                        this.selectedElement = nativeEvent.target
                        setTimeout(() => this.selectedOpen = true, 10)
                    }

                    if (this.selectedOpen) {
                        this.selectedOpen = false
                        setTimeout(open, 10)
                    } else {
                        open()
                    }

                    nativeEvent.stopPropagation()
                },
                editEvent(ev){
                    this.currentlyEditing = ev.id
                },
                updateRange({
                    start,
                    end
                }) {
                    // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
                    this.start = start
                    this.end = end
                },
                nth(d) {
                    return d > 3 && d < 21 ?
                        'th' :
                        ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
                },
                

            },
                computed: {
      title () {
        const { start, end } = this
        if (!start || !end) {
          return ''
        }

        const startMonth = this.monthFormatter(start)
        const endMonth = this.monthFormatter(end)
        const suffixMonth = startMonth === endMonth ? '' : endMonth

        const startYear = start.year
        const endYear = end.year
        const suffixYear = startYear === endYear ? '' : endYear

        const startDay = start.day + this.nth(start.day)
        const endDay = end.day + this.nth(end.day)

        switch (this.type) {
          case 'month':
            return `${startMonth} ${startYear}`
          case 'week':
          case '4day':
            return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
          case 'day':
            return `${startMonth} ${startDay} ${startYear}`
        }
        return ''
      },
      monthFormatter () {
        return this.$refs.calendar.getFormatter({
          timeZone: 'UTC', month: 'long',
        })
      },
    },

        }
</script>

<style scoped>

</style>