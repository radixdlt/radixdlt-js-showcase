<template>
  <div class="section">
    <h2 class="title">Read Data</h2>

    <b-field class="filter-box" label="Filter by Application ID" label-position="on-border">
      <b-input placeholder="Application ID..."
               type="search"
               icon="magnify"
               v-model="filterValue">
      </b-input>
    </b-field>

    <b-table :data="applicationData"
             :paginated="applicationData.length > pageSize"
             :per-page="pageSize"
             ref="table"
             hoverable
             default-sort="timestamp"
             default-sort-direction="desc"
             detailed
             detail-key="id"
             :show-detail-icon="true">
      <template slot-scope="props">
        <b-table-column field="id" label="#" width="5">
          {{props.row.id}}
        </b-table-column>
        <b-table-column field="timestamp" label="Timestamp" width="300" sortable>
          {{props.row.timestamp}}
        </b-table-column>
        <b-table-column field="applicationId" label="Application ID" width="300" sortable>
          {{props.row.applicationId}}
        </b-table-column>
        <b-table-column field="payload" label="Payload" width="700">
          {{props.row.payload}}
        </b-table-column>
      </template>

      <template slot="detail" slot-scope="props">
        <table class="table" aria-colspan="4">
          <tr>
            <td class="detail-label">Atom ID</td>
            <td>{{props.row.aid}}</td>
          </tr>
          <tr>
            <td class="detail-label">Encryption state</td>
            <td>{{props.row.encrypted}}</td>
          </tr>
          <tr v-if="props.row.isSender">
            <td class="detail-label">Destination(s)</td>
            <td>{{props.row.to}}</td>
          </tr>
          <tr v-else>
            <td class="detail-label">Source</td>
            <td>{{props.row.from}}</td>
          </tr>
        </table>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon
                  icon="emoticon-sad"
                  size="is-large">
              </b-icon>
            </p>
            <p>No data.</p>
          </div>
        </section>
      </template>

    </b-table>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {RadixIdentity, RadixAddress} from 'radixdlt';

  export default Vue.extend({
    data() {
      return {
        pageSize: 5,
        filterValue: '',
      }
    },
    name: 'read_data',
    computed: {
      applicationData(): Array<{}> {
        const identity: RadixIdentity = this.$store.state.identity;

        if (!identity) return [];

        const rawData = identity.account.dataSystem.applicationData.values().flatMap(a => a.values());

        const formattedData = rawData.reverse().map((d, idx) => ({
          id: idx + 1,
          timestamp: new Date(d.timestamp).toLocaleString(),
          applicationId: d.payload.application,
          payload: d.payload.data,
          aid: d.aid,
          encrypted: d.payload.decryptionState,
          from: d.payload.from,
          to: d.payload.to.map((a: RadixAddress) => a.toString()).join(",\r\n"),
          isSender: identity.account.address.toString().trim() === d.payload.from.toString().trim()
        }));

        if (!this.filterValue) return formattedData;

        return formattedData.filter(d =>
            d.applicationId.toLocaleLowerCase().includes(this.filterValue.toLocaleLowerCase()));
      },
    },
  });
</script>

<style scoped>
  .detail-label {
    font-weight: bold;
  }

  .filter-box {
    width: 300px;
    float: right;
  }
</style>
