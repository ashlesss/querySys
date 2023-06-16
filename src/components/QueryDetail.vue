<template>
    <q-page>
        <div class="column justify-center items-center">
            <h5>
                {{ result.work[0].work_title }}
            </h5>
            <div class="row">
                <q-chip 
                v-for="(tag, index) in result.tags"
                :key=index>
                {{ tag.tag }}
            </q-chip>
            </div>
            
        </div>
    </q-page>
</template>

<script>

export default {
    name: 'QueryDetail',

    props: ["result"],
}
</script>