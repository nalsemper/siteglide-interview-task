---
metadata:
  studio_theme: studiokit
  studio_library: studiokit
  studio_dynamic/type: list
  studio_dynamic/files:
  - views/partials/layouts/modules/module_3/default-blog-card/list/wrapper.liquid
  - views/partials/layouts/modules/module_3/default-blog-card/list/item.liquid
  - views/partials/layouts/modules/module_3/default-blog-card/search.liquid
  - views/partials/layouts/modules/module_3/default-blog-card/sidebar.liquid
  - views/partials/layouts/modules/module_3/default-blog-card/archive.liquid
  studio_dynamic/theme: studiokit
  studio_dynamic/layout: default-blog-card
  studio_dynamic/theme_id: theme_01
  studio_dynamic/module_id: module_3
  studio_dynamic/layout_name: Default blog card
  studio_dynamic/live_updates: 'true'
  studio_dynamic/ui_framework: tailwind
  studio_dynamic/original_name: Default blog card
  studio_dynamic/sub_module_id: '0'
  studio_dynamic/make_global_form: false
---
{% assign author_id = this.properties.module_field_3_4 | downcase %}
{% assign author = author_results.records.results | detect: id: author_id %}
{% if author != blank %}
  {% assign author = author | add_hash_key: "Title", author.properties['module_field_6_1'] %}
  {% assign author = author | add_hash_key: "Image", author.properties['module_field_6_4'] %}
  {% assign author = author | add_hash_key: "Image Alt", author.properties['module_field_6_5'] %}
{% endif %}
{% assign then =  this['release_date'] | to_time %}
{% assign now = "now" | to_time %}
{% assign time_elapsed = then | time_diff: now | divided_by: 86400000 | round  %}

<article class="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
  <div class="flex justify-between items-center mb-5 text-gray-500">

    <div class="flex flex-wrap justify-between items-center text-gray-500 mr-2">
      {% for category in this['category_array'] %}
        <button type="button" data-sg-live-update-control-params="?category={{context.exports.categories.data[category].id}}" data-sg-live-update-control-group="category" class="bg-primary-100 hover:bg-primary-200 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800 dark:hover:bg-primary-300 mr-2 mb-2">
          {{context.exports.categories.data[category].name  | replace: " ", "&nbsp;"}}
        </button>
      {% endfor %}

    </div>
    <span class="text-sm mb-2">{{time_elapsed}} {% if time_elapsed > 1 %}days{% else %}day{% endif %} ago.</span>
  </div>
  <a class="hover:underline" href="{{this['full_slug']}}"><h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{{this['Title']}}</h2></a>
  <p class="mb-5 font-light text-gray-500 dark:text-gray-400">{{this['Subtitle']}}</p>
  <div class="flex justify-between items-center">
    {% if author.id != blank %}
      <a data-sg-live-update-control-params="?module_field_3_4={{author.id}}&author_name={{author.properties.name | url_encode}}" data-sg-live-update-control-group="author" class="flex items-center space-x-4 hover:underline">
        {% if author['Image'] != blank %}
          <img class="w-7 h-7 rounded-full" src="{{author['Image'] | asset_url}}" alt="{{author['Image Alt']}}" />
          <span class="font-medium dark:text-white">
            {{author['Title']}}
          </span>
        {% endif %}
      </a>
    {% endif %}
    <a href="{{this.full_slug}}" class="inline-flex items-center font-medium text-primary-600 dark:text-primary-500 hover:underline">
      Read more
      <span aria-hidden="true" class="material-symbols-outlined text-[16px] ml-2">arrow_forward</span>
    </a>
  </div>
</article>
