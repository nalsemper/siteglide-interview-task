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
{% if context.exports.module_86.flowbite_datepicker_script_included == blank  %}
	<script src="https://unpkg.com/flowbite@1.4.7/dist/datepicker.js"></script>
	{% assign flowbite_datepicker_script_included = true %}
	{% export flowbite_datepicker_script_included, namespace: "module_86" %}
{% endif %}
<div class="mb-4">
	<h4 class="text-lg dark:text-white mb-2">Archive</h4>
	<div data-accordion="accordion_blog_archive_{{sitebuilder_uniq_component_id}}" id="accordion_blog_archive_{{sitebuilder_uniq_component_id}}">
		{% for year in blog_archive_years %}
			<h2 id="accordion_blog_archive_h_{{forloop.index}}_{{sitebuilder_uniq_component_id}}">
				<button type="button" class="button-secondary border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" data-accordion-target="#accordion_blog_archive_{{forloop.index}}_{{sitebuilder_uniq_component_id}}" aria-expanded="false" aria-controls="accordion_blog_archive_{{forloop.index}}_{{sitebuilder_uniq_component_id}}">
				<span>{{year.start | date: "%Y"}}</span>
				<span data-accordion-icon aria-hidden="true" class="material-symbols-outlined text-[24px] rotate-180 shrink-0">expand_more</span>
				</button>
			</h2>
			<div id="accordion_blog_archive_{{forloop.index}}_{{sitebuilder_uniq_component_id}}" class="hidden" aria-labelledby="accordion_blog_archive_h_{{forloop.index}}_{{sitebuilder_uniq_component_id}}">
				<div class="p-5 border {% unless forloop.last %}border-b-0{% endunless %} border-gray-200 dark:border-gray-700 dark:bg-gray-900">
					<div class="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						{% assign months_by_year = blog_archive_months | group_by: "year" %}
						{% for month in months_by_year[year.start] %}
							<button type="button" class="button-secondary" data-sg-live-update-control-params="?range_gte={{month.start}}&range_lt={{month.end}}&range_type=month" data-sg-live-update-control-group="archive" {% if filters_values_from_URL == true %}{% if params.range_gte == month.start and params.range_lt == month.end and params.range_type == "month" %}aria-pressed="true"{% endif %}{% endif %}>
								<span class="mr-2">{{month.start | date: "%B" }}</span>
								<div class="relative inline-flex items-center cursor-pointer">
									<div class="w-11 h-6 bg-gray-200 group-focus:outline-none group-focus:ring-4 group-focus:ring-primary-300 dark:group-focus:ring-primary-800 rounded-full dark:bg-gray-700 group-aria-pressed:after:translate-x-full group-aria-pressed:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 group-aria-pressed:bg-primary-600"></div>
								</div>
							</button>
						{% endfor %}
					</div>
				</div>
			</div>
		{% endfor %}
	</div>
</div>
<div class="mb-4">
	<h4 class="text-lg dark:text-white mb-2">Search by Date</h4>
	<div class="mb-3" title="Search Blog by Date" id="blog_archive_search_{{sitebuilder_uniq_component_id}}">
		<div class="relative mb-2">
			<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="range_gt">Start Date</label>
			<input class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 datepicker-input" data-sg-blog="start-date" id="range_gt" name="range_gt" type="date" onclick="if ('showPicker' in HTMLInputElement.prototype) {this.showPicker()}" value="{% if filters_values_from_URL == true %}{{context.params.range_gt | date: '%Y-%m-%d' }}{% endif %}">
		</div>
		<div class="relative mb-2">
			<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="range_lte">End Date</label>
			<input class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 datepicker-input" data-sg-blog="end-date" id="range_lte" name="range_lte" type="date" onclick="this.showPicker()" value="{% if filters_values_from_URL == true %}{{context.params.range_lte | date: '%Y-%m-%d' }}{% endif %}">
		</div>
	</div>
</div>
