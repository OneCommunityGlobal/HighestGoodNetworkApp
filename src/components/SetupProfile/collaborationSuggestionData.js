const collaborationOptions = [
  {
    name: 'Microsoft Teams',
    logo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABdCAMAAABkSTMDAAABSlBMVEVHcExQWchDSrFDSrR7g+tQWcl6gupVXcNQWcpWXsJmbtlpcdxud99WX81QWcl7g+t7g+t5gehQWcdQWcdSWsZ7g+t7g+tTW8N7g+tRWcFRWslVXcF7g+tPV75QWclQWcJ7g+t7g+t7g+t6gulMVLx7g+tvd9lYYMJ6gut7g+t7g+tJTpBQWclQWsppccpIULhHTrd7g+tQWclNVb1PV75RWb9UXMFGTbdHT7hKUrv///9MVLxJUbpASLJTW8BWXsFDSrRETLVudtRCSbNXX8JaYa89RK9xedo+RrBFSoV6guo7Qq1ES7VFSpF2fuP39/13f+hXYM90esxKT5FYXqqTmNf9/f5ka8E7Qqg5PXdiabw4PGtZYcOEitJsc8hpcdGAhs+JjtFUXc319vtdZLROVJnU1u+9wOdPWMk9QnxUWqPMzuy3uuRHcEz3nxdnAAAAbnRSTlMAMirq8P0xKu/rFAQLH+BL5j+yoVqO+JBgRtD9tP2EOttyqLvzv/L90oHJ33LCvtHe/////////////////////////////////////////////////////////////////////v//////////AL3rN5EAAAVZSURBVGjetdrpX+JGGAfwYANkA+E+BFnAE8+2gcjR4H2tSt3uqvVq0e5q6277/79uJgnJXAnJEH/6hsVPvjvPM5nAJBznM7HIynyqIBdSq/mkyL1JYum5lDwKvzgdfwNDyvMykvl04EZ6VcaTmg7aqMtk+NlAjciyTAsf5FjiFZmeeiQ4ZFZ2ylxgc0xcdkQKScpcZzpBpmXnzKGHjOaK2Ux2veZ7gLGKC5KCuxItJsLNZjjcFDIln+ORUi5IAZpguUTTilD0t/AkCy6IvGIbQjNsK82sL8WtJVpTRn9WEppIXouxQCYwSMU8lLiBjANUrBQ4ksMILZl4YOUykFiGMJpCyPsMdm983pyCCRIJr/tYHVMXUM4wxJzCNYFEmkUfy+OP+1BOLtCF2DgZY6UwBcka70lRDyk+GhkOHwGDjKViNtcZiWYT77yk3W5vt7e31ZeXZzAWSrW4EK1cVfBG+Q8zDe33UMuOnraebZBN48eMenl6hCKLo9NaLFMan9PeyJjA4SgQYTGWANI/vbzZP7HrxdsrfZE0EpL27+9QZByhKGAozzBiL1y0eoFqcZpw6DSKNkkom0oL1MtG8vApXcWNMhgI18CIHWcCGFoQpIAYnJihLl0Nz81QFBKpT2OrrIQoiRyHIF4JRVEtJJUnP6iIVasv4UyNgxEPzbAG8n5t7Whpia9XZumfhULVsiCEhUQ2Z1Wy4TSMTQejtVCaqqXTEdH5ciRGa6WQBL3fQAjKYVtakBcLNd+fdRrIKJ6uaXnatAkmZAYp1D+/0PL3DmQwIlAzXBCTUNWF3FQoQk2IEr01M0i/HZC2TahqT5vC2uyiZEkgk8hGYQRMqf8+ftXzUT/46MW/bdvo9fq/IssKnLNPlLW+HLUQY9oOPxu51pVr89VQsYfRU10Q+aRJvWzNoCe4An4U9fNXzfj9z55+YFW1iZ7rSOTfvlAQQUeINaRlIqqCNMMwum4IrV5hgJBriIW0cKPfZ0JoawiGwES/y4BQl0IEgSqlG2wIuRK2rMaTRLfDgNAWW3R2IcSkiEIgfQrRmQSBrxk2glYKEJ09ZgS5LNkIOQwmBCf0sw9GMKKzx4hgRKvVM5GucfYhxN4uC0IQLdVCkGYYxoABeU8Q2rTtG8hTlxjGYLB7MAkCLVMWQhK7kyDIStgfGkgHIfYAsXvAjGCLbddG4GboxMEWG0Iu6BaCVQoYbAh5zRiNZIAQ+jC2mBDy0ochcKVAPrAi+IJuIrt4pRgR2qWv2xkhFOIDG0JeMzrbf4EcDrBKAYIJIS99YErp//2BRcDGsX+EJKjT1iaOmRCfxPG5TySsIda07VLXEJzwj2ifIFX86oqeGYRxfu4bKXO+KqUbvpEs55s4v/Xbkxy34FipLUqlxiKUT/Vlicv4aIZh3J46IxdfqBteoZ/GVQo1zm+/uSGkkdC+znFT2Z9/cMjB7fEtkbu7U3Qrasw3rXVzD3IqOkVN9Y7Iw8PDt9PLe3R70M7jK7H5PG63vgSOiUczvt84IGefXslvpePu/qxdEnl5+X51db9/4a3vZQ/728Urem7oxhnekkzUw3ZF6fmIlmeHjmDVSlRFb/va97TsOxjLGwK0jVr0eisgd0Nm6DB95cJ0vFTNlBNaNrI5yfsW/fwFkTPHuyhgpy4mSlFJ8ndjLsnLXsMz39GO5T0j+QnulC56NBYneM4gFql7Mia8zZxMeTBSyQmfi/CgTGqAsYyrWH1yg+Mi7t2fD+a2v5h3Pl/4lcCeX0lX6HcaC5UgnyqJJyvkaPhKMtDnY2JcPJ1fhR1+NZ9+i0dwxPTs3LL+KNHy3Gzaay/+B4+FUO7ocn/GAAAAAElFTkSuQmCC`,
  },
  {
    name: 'Zoom',
    logo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAOVBMVEUAjf8SlP9Jrf9ctf8fmv/j8/9pu/////97xP8Gj/8qn/87pv+Jyv+c1P/w+f/4/P+t2//S6//A4//lBXFtAAAD0klEQVRo3u2Y27ajIAxABQJyV/z/jz0EULFHrVU7s2aW6UMVlU1CCAlN88gjjzzyyD8jBEBrIOp7AMNkFisl098AaWEl1UkHpQB5jNyNkJIu+1TA7K0YIqxZsQ5h1tynxuaQQYqblDE741VMwh0MauHC46N6wLtBXLYYvB8olReXjDriP4JdgzBxxMOtvmasQ/Y2lwwm6LH3pLmiiDoadc6rwtKMKipfhM1zoJM9ldTnXSu5r+rbV+EyzxWRIfdOTzuYlvn/N6Tt0iPTt16XIKYuWWtNk7YNpFGCR50yRJ0OYcJsatJy0H3XTpDp3Y+npIxuVRNuQv7XC60/36rK7K5rQvkCYsRZiNrR5CbI5DFHIKMnflUTfU4T9UfmZN+7XiCnl/wYkFYhmoWFC9OzK758aFcXY6NdN0NOR8jRztSvQmI+FEYIOZ1NjF8q6Vch0adcgZyd92rDU9S6Fxn5FC6FrrR37/jeiVxgw4n1R5vC/arcpAiqcsTWStDmihwa4+U89UAHcD2vF0K9Y9xQbsl9Clh6nRGnda9k07cwMERtZ+30vtLUbFSmIO+pGKcam/7CQGy891gi9igMqY4KqFzhXtcmdisFo4ZSJqQU5kunOEobhkINfO+c6JH/UVT0zUoMTKeC1U1ZNFUTwQsSva6sInxdby4gMnS++nWB5QAY4rUPzlRBJjfliGZ4EGyIOZMfmIqBZsBneLku7rUshBgb+Xjn5ZiETU0cNwHj264r1aqjw1i4bu2o0C9zuFjYitySO0knB8p2c0sXt01Tf+TnZ3JzVpjIkgY0kJSfBsuYHMbvBHYRJGMW823PMsQ7xpwvJT4VWLL6d3tAMtIABLt2kAuinFxDmEwBmG8HQEgn0rbjU0mRTBof2TcMnxgNi6/2ZDydQIM1ErFlUhVOokBIr6Z7l50ooCF2U4fE0MkTZqUhfdfPxUIMl1HhHk1a7C8QOtVNHI4w0FrVcFwp3vvJO7GrASFihrBDkImRdJ57REtxnCy7cPrATkBmRtKkgthSKLrLkIrx8qaKyKAXFkzT+7m5akYy0LymsDOHY++mMgHXjDUfQtSS0aD38NIlTnlHE4qXdA5t582nkMQIFIqoVPZ6awjReLSFE5TWApc6NqUYZpsPIWmBt54XCQ5IquB5CCkmppNAPdRNccWuQpptTV7DsFNQnRMMeV3qoWrSOQoX+yGPzf6+DjH8VxlNZCjXUxECltennaab/A1tWSA6bHqXWVbSqV9gtu+dqFNuLVzfW5Y70W5Ox4mY9jZtP6wjlTrStFuDP/LII4888vfkB8PtORv87/HOAAAAAElFTkSuQmCC`,
  },
  {
    name: 'Cisco Webex',
    logo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAABXFBMVEX///8ASm8hu+n+//4guuoASW92tTsASnAiu+p4tj15tz37/ft0szpBxe3s9eSo0IL5/f4ASG58uEMoves3wuzz+e7z/P632Jdo0fHl8doeuul21fKLwFiAukguv+sFT3GYx2uRw2BbzO/e7dDf9fy/3KL4+/WgzHfD7fnl9/3X8/v19vZpqUJPye6w5/fN5LcwMDCw1I2FvVDP8Pq66vjr+f6D2fPX6calpaXJ4rGn5Pfm5uY8PDyb4Pbe6O3r7OwOVnojIyMdXoDa3+IgZ2K6ztgPWGlSjKSIv1Tt8PFycnLS575dXV0YYGVYmkprlqyApbfV1dVJSUnKysqS3vXF4KwnZoaBgYFLjk9TU1MqcV0UjrrF1t6UlJQIZY3N2+NChlNNgZu8vLxpaWmcnJyHh4e5ubmWtMSsxNAZncoesuE1b41Ad5SysrIMdqGNjY2QxIRrv9sYGBgAu/4Blu3wAAALP0lEQVRo3uxZ51/iWhMOpEAgtFCEIF2KUqSpKLiKuPauu5Zdt7luL/e+//+Hd+acJEQFCbt7v9zfHZHAITlPZp6ZOXMmDPOf/DuEDU3PFJqVSqVZmJkL/RMIocbSfNoViPv9dr8/HnCl5yszfxbI21hOB+wKx3F2KhyncP5AeHnG+8eUKEQDdn1+XRDSFS38ERhvIRx/iKADBaIN9rcxpqJxZRgEiqIE5qd/U42Ky0onsxre7x44e7n5O8rMzccf00KXwNmvO9pU2AyC/cvnF5///lWTNdJmIJQXrxI22+rmk1/CmClz1O5WozdhsIAn6GPWFwmet4G8/RWUmTSnIlhVLE6xB1zldDpddsUxMslPn1d5m8WGr7cr43MetqLY6Tsi+MvRpcZ0CGWqsBR1+RX86YfPxoMq+H9YHNd35+n0mijxcGXa6Kje6aV0XLF/eeXjKYiFTxyN6cmVOCoBJoE3ePnDhYdOGmqmNRAivtWn4xHiUnB2/AMwzrU0OA7mzgJgLovFYuMtcPB9G4d8b5TQilkRD+nG0CWmuYmcExz8G8dgzThxUUK53R6eGn5m7q91AkGR+LXX5nN7WCHTU5DwY8Hs9JTWCQB52XyH3jEUwemRdSuXnnr0XI9Q2rcRISBrL80ygoqomnCuxuMneyTHwQYBIXHPH5pkpRHop17/0ojiwiOJ4huLTRP+uUkHOzPkqvCIHO7MC6KjtK6D2BIfzdGe5rQViYsXRpwcTAqi6DhI6CC+Ta85a+nroBIedYV7EkBEaZ3XyPeZs9cSMk5B/M1RJ2diIspFn5XEJzN1YlTR0jtXnht19qIDMRylDZsWLPyReUoI7fOj/JH1CEQT4cpAitPEwu7SQfyVUSe7UxTE0fdi39fiOFGiBBqjTt6VRQrS9y9TzBf8urVco0oQp2otUdRJsZlJkmyzH4rlEZHIRuoqhgMSmIVajF81kb4q/WInPSrca6ImBAQXLgAxsT5WcDEkC6IyKqdk6sRaArxL+zxRBNYUUyAEAlfeUZrkKCMC1YTXUqQZkCYtUwBIGRGLi7JGO0YjzfQgZjgp+NUqiFMe967MJNhJEIS+d2E1Ycq7SJyQos7OPRon7qSuBwjEiQWLL5NxMu2i6yK8PbZiBT1GDIx44BwrVlMRH0orWmmqDM9dQY9oBJGuSEVsOndhFlarYKU8jBS3h7iumh0FQgl1YXNZGNcTu51GypAMyUaS2vyqJrie0OLLljBVq/aZHxKOucVJo6mMK6PN7MpoWFDsA9Z4NuOR72E4LtQczJukBGRZ3dRi+rqvijMyUUdTqTACjUSiCC0iTa2++opCl3n/slGJ4IKnLtxTQ9TqLstYdZc3quiJ+Eug4AQ/Zp05d2a2lpIHQGgVJDWY2bqeLeAOCHT5/OPVqx+bf3lqNU8+mYqJAxDAYlotTGg3X9ZDVU/2zqu8z+dLXJUEIuJA0cpHdcU6dJoFYQpxAIG9M738quQQh4qxRLXZxtif4LYUd4PapesHQxAc4sG+EWOsnRY2Cj4nLLodNi6kAco4HKU3G+oZmORtvm/bY+5+X2iVAfH+9QPJ4bgHIV2sWwx8AOvj7X4Zdv4OiMWSuLoowcQO/EcRShfrWq1FT+QTH8ftSIX+XuXvmJu37F9dHJRKklQqlQ7eXG30a2yKMbgjwT4GzM5sktXUKKDPxv76+vr+RuLuDwRk8yEh7PHPm533bfh03Bq8lL3+xj+YyYJ3/HAYRwd0idhWtXOzVz05ZphWZ0h7p/dNcxtatpGD1hi4O8bbBvW7Trs7bcZ5Wt0rMivHGKXFohqrRVUvZ9H5ZBPi0cJTavm+G6lf9DGeTxwOcF7nThUtxbR2VpjTn0Wm2Nq7vDkFjtq3l5e3+NPpzuVe68nRKt+f2WaEMY751j4OsvhK54Zarcgy7wGv1d25Pqn2mO296u0tqndaPbne6f4sfvqqUqD6s8Xy4Atv+/Z0oAu1q+cGdlaY8+4x0z4/Zr53PzDMh70ec9NpM+x5t8c8OVz1kZ4Zr/a1tIM25ls7GsJpu7pDjtvHRaLJabW6d33MMrcAiOqtdM4JcQDpfLm56vMRy5OaWj+gHj5+7fD1sEgoXp4QK7Y6xwCywrC91k6n+o45R0/LtXMayHdy8tPDNRvpnZEyFPuaRA9YBp4fvnwkt7//XwupOTkpEpAWfOuBdq3uKZjr5JjdOwF3uQYjUj/pfXy7loBZqRo4v49PPN/8+OTRRLKy1z1/9/0S7YHm+tm9fnfdfc+0OyffWx0g/kP35sN1d8epp4Zi79PR269rq5ivEqtrX98efXoycoFqn3eq1ct3cPmHm21m+7bTOfkJN3+61+ns9ODev192Orcqo7P5/C5iebd7L5+ivO5tI4CJfLjda+fIfZIb2m5TV3eubNNri20tvtgJScqOTHa/+yxrQhCz//gDs/9AnMFgkB30MUc/BiO7uxm30whiHFJXz5lms6A+CAzNzc1pfuGFz9goi+RTyYjqoMlk3q22SpKpLJ7pzqZishybrEV0kCAd2vJkNJhQJR3w+/2BcBMnbKbLZXU3wy6Xy9Fp0taTxGdaq1KQd9VWCR3MJKEideBOanJXBanlRYkO1Z9RlOmoX4FCk1OUOD5smgsrimuGbtIDCt1twoWCh5wdTMFGeYIlRXtKqMO9Z2AkNbG4WJsUha0MBak75GSWDsUWWfLoA3bH0eWls7Sf8y+z2N7n7FE03VSZs8/TtuJCTEi51QafLCRzdEzK55hgXhA9brJry4tCMkhAhFg2qA1NRkjLlSuTB5lzZ3G6F6/EOVQgFLVzaXWvCXctL5C+glhPilvE+FkRrTUr48zaXl2eJSBizUlj3p0SUG+470BBq2mtStRLaltsVS/5+w1rvHKCUpKclWEqSPF5CazlzEsqRegUsgRGBdNORrTrnjmEVBB2Y1yU7T8HcWGvfS7NceGCS4nr2392QUbbgEZSzT0pISnuLRyBL5NupyqROhpV549otyXEMl7YXFRYLxXYadC2a8Ol+ANW63y/z6uyHImJs3DzSMquLGSRIyHm0QW+RBCkH4y5pOBYDJUVezqqCVBOd31LcSunE0I7YoJjllASYbKIBwaMgS/tgqNKugjIHFh21tCAksQs9kaUvnDKvN7NsC/fbVIKNZatoRILMuBB6CDhC7Igb032JZW5C4Ld+eycCx8HGuSMbp4CHMep0aJ1wKVUEGausfixxoD9J4hLS6mI2yA55k7uQnM9A3P5K1MGIZ2x6TRwcvchgtMD5onU8SZzSMqiiNaixN9PkIKHNXTn5QWvxvW9/ZkSbgZobPb9U3w2i5RghNQzHmItBKQBRHJAzTOBmqiBq1p5y80sW7l5ffLlcHSGRiNE5bJfjyDVXnkP8SuIdTmbItZCQCGf01vxNE5EMaveHeQD9OdGQNFDbiZA4gTCBVsLofAdB4N8WK8D+dQGk7KqAMS0XKMhD1kMApOmlUWa6SZkIbZAHxKqTwanw6CVl0yObLANl567iL2wNzKr5V8MZDocE8RkdiGzMLEFd50jIBg8s5nMYl4W/t+uFesgCENBYwlBFAagmIIQCdVgk8YICCkJO4kz//8r8iwtLM4uvrlD3717d8m1UmEYj7ZOU1dFzy2QX9T7qrcJsFRnWGha8c9CSowOD2VdIwQoXuJNeg9OM0u9aXuebeouCw7fSlLfigynAPZGKocJQfWrBa+ynOHPs+HUrtKmElKUJJPSexkGgY+Qe+ySs1Dzoo2TWobhOzD1ZxwEsaJuxYOg0TzGhLjy+leXLM6K0J68xCharI9Ngu+2YrzneEVtWnd9V1PAP6SM6RQZ3RijXx6q0OZfv6s3sYGNyvpZUKEAAAAASUVORK5CYII=`,
  },
  {
    name: 'Skype',
    logo: `data:image/png;base64,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`,
  },
  {
    name: 'Discord',
    logo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABMCAMAAACsw+I9AAAARVBMVEVHcExYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfJYZfIP4PWkAAAAFnRSTlMASrbPCvMF+jTqfB3DW+GLbCeeE9ir3Gy4sQAAA4VJREFUWMPdWcm2pCAMlUlAkEnl/z+1fdakQNDqJ73oLKtyDElukgvpuqpQjwZMEKyACB6Qp93fSq+QxYbFGBfwI/2y/s0Mtkj131ugwi2Gx4cw0BXEnircLE585VDvHZZxJ5ArmyNvkdiJq/5M43Kw8HCFTkoIhMZNEBJCTbQTqaJcRnXFiYHwmIkOmBjJ+PMvzpk0RAeda3IynLlDrYm/FmnryXE83iGuZsPPt9iIRlQSEuJNAldWN7K7jPARxK6OtwmBkDzEG8UCWTd3GgFyb+OtEkolmbWI35YkagnfN4z75o6UBsT9jhRcud+Rgis2NpAEYPfWyBtgol2xA2U/kTZGDh0M8TZG9s24BX4zFLdJe5J618pG5MM7WriZkYhfc9jLdkbe8WoXrR07WioxNRrrKizkj0KlAvADXwokWxyPilLqHcgwiPOrghoxaMb4eiUy98raNBTJErfTi946KK8cVfsW23Mnx0r43HVZJGv9CwLwB+Kblj3r5BCN3kAMpURPhz6tsh46++OFAFeSItg1opkBfUivdhyej0CVzCnPTEuWpewNmhcOHrwZC6AJjsmUkhGglwc4lDmXDcUqOx+vmhYSWo54ZiTk1zQw8BAXOjWyXL0VrD0SMTCSCf3DWRSu0aoVp1ANZd9I68mk8IOyu8ILYnUZQtMyyApJwI0lXLwq9Qs49M6429Lhi/Qvz13iigDHju7gy6jeB90XkD7vjzHBRIF0lecB/OmAvngW8rGiKuPVdLXZSkb6fDcCjmLco7dQVLudy67KVLgeRjRaDQ5XTuyqMOjqKwPrTunQKU3mZxqsu+2lo3KK/8iIbG+E/Rsjpr0R2c3tjZhOtzdCoC7Msf4Sd1xDrFsD84QNlKLwRb7kgiZapuXrPEGkbEQVnuxB+OjtVRvg/j+bERXKf20NlgqHTbU3cYmHbd0wueJxedgGRg80cuLU4/UeWTwXD8KMtuNjQ6McKZ5lHt8307IzcbbPt/1eiXEImMxGbmJmgoMdhXp8oRe2fE4Wdsy/h4bO4XGknyblxSre/+w11h/Aa8UTVuhIZSc3f/G6e4k7mmHKn4ULW41ZXTNScEVaX1QVNgEsd1cXVGOSdRngvYM4eoOny3u2Q+MwVlS199smKa7v2j4clZPBf7E3G77Z6D1zL/F4LY+92DjO9WC9GOSzvVyOMbJadF+J0AEBx/oDDVPJLyMIWW4AAAAASUVORK5CYII=`,
  },
  {
    name: 'Google Meet',
    logo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABSCAMAAACVH4HWAAAA5FBMVEVHcEw0qFMZZ9L8vANChfX8vAOEa6o0qFP7vAM0qFM0qFNXq0n7vATqQzXqQjXqQzRdrEc0qFMzqFPqQzUrlH40qFM0qFMZZ9I0qFP7vAQ0qFM0qFM0qFMic8gZZ9L7vATlug37vAQ0qFM0qFP1kBa8rRRToT0xo1D/vQOrh3IZqARChfQZZ9I0qFP7vAQYgDjqQzUnlkc0qVP8vgMyeec/hvcojIo0qVH0hxnqQjUVfzgchDkgjUAypVHwuQYtn0yvqBU8ii8rhTPLrw+PoBzgtQp2mSJhkydNjixUkCoAVMpHcEydY4MZAAAATHRSTlMAb/Nub2T+9PNjdA5w2Tc/Ikyg0zfdtt6Frcbu551l4IhU06vWb/HNb6b///////////////////////////////////////////8AQmt8ywAAAi9JREFUaN692YlW2kAUxvG4Nca0mkQWEXEp3Tz1EmFa27IJ4lLf/4UEJHWYuSlMMl/+L/A7nJuZcG4ch23/065pZ7UL3zFp//C3aBkmxG4tMDL+mCOzar6BcZ0REecGRlakdRasb2RGWhfrG9mRnfWN7Mj79Q2LiJ9qWENK0XEzTDFsId4JEdU93rCD+EcuzSrLxodrq0gQ0SLesIGUjklDDmTDAhKWSUOWjdyIv1cnDVGMvIgfEWmIauREggrpiGbkQ8KPpCO6kQuZn0AVYYzsyFZyApcRzsiMiPOI9Hgj8+t38oU45B3f5c6KahwyGrc7HPKTb3vVm2dLJ4b3d10e+c6XARk+9roxFhEPT/E0LDIZd+HI6G5uABExvO+9GjhEPDzGSShETJ5jOLIYORARw2TkOEQaOQxZnEAoIiZ/u3BkNFYN68js0o2xyLf5pQtGPj/FXHaRjX4RyKBfAEKDdgEIUbtXAEK3vQIQuu0XgJA6fgiijh+DKONHIUsKCul0pIcM9kvk8SORfwoQeXvIoEgyfjDyesegkfkdwyM/+BreiprEKjxyxXfzi8zrDPp4ZNrXegHInryCQiEb8jINhzhBswDE0dYrCMTxlUURBFFXXiBkeXmHQqStMBCRF6o45G017CKR5Fw2och0MC65lQCLOH7ohb4DRhYVglTtIiGLNKwiZf5jZqlqEzlK+dtxumkPqaR+YD6tWkLc6D9ffkuN6qbajWvaScVL+x0vTAIpMGh/9SwAAAAASUVORK5CYII=`,
  },
  {
    name: 'Facetime',
    logo: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAA0lBMVEVHcEwRwS8QwS5Y9HJX9HIRwS9Y9HM321IRwS4321JX83ISwjAQwS5d93dY9HJP7WpX83FZ9HNd93dO7WkgvnH///8gzD0LvSlX83FR72wayDdJ6WQQwS5b9nVL62YcyjkUxDIeyztH6GJN7Ghd93cZxzZT8G1U8W9F5mBP7moSwjAWxTMOvyxZ9XMkz0BC5F0n0UMq0kc/4lo23FIv10wz2U884Fcs1UnH9s853lUXxjXQ9dbz/fW788Sb76mI6Zhu6oMy1U1e4HRX327j++dHcEyE+4p2AAAARnRSTlMAqTQ0Z2fXH9IJoeh/6IDot8bNzP////////////////////////////////////////////////////////////////8AUL4YpwAABYdJREFUaN7dWml34joMNXuATrc58FjaQqDQAG0IYaBsYWv//28a77EdE0hK5sO7kmVZlnRxwumBEgBkFDPZ0uOv19j49VjKZoogDIXs/Q8IONF9tnCa4jb/eiXkb/U0xWz++RUKArGxgWges5qLVij9tLWKUuAwmYePj+eP6+H54/n5IaNw5D8SQD4TiaN2qXKpISuyFB5qCeGB35diqZYYSuw9lq29weXbqbyTG3DnnNRqWXqx8m/JoZ8nF+w2QQoot+QgfQi4wkGiAdFDytAmvvXr+CjZfnzUmXAnmFCHd6V4X8fo18PBW+ky+yH1g/siyNzVL8JANppN5oqC9C4DsvXBYEBHXSMMdcEo0XPIghJzu0iDImwTIwe7dbrRpR00KIHfgy7EgGpQunifuH4OBXckV8VvcNdNHHcgeY6XLui+vHSRIKXTS1BeUBaeBR+74WhiC6h/TmhOl/ksTI0wK2VoAk2IC0iaqtvEgxjJIQl+BiNJGnqSjmZgy53L0Wl2ADKyIFjn+nQsC6dR9WfiECGm0wF+yN9q7rfeIhzedt8kTWljOlv+okNehmVZwFI5LGvvbSrnsfH2lg7jYAgEQ7vvymXY7AK18Bps953zJLtNpRKTZVxH12Cz7QRIxmOoDNZ4/125HJv9WMR+TcK7sQxAKCwqY8urRMGiI7xA/vq8AIkEd7+JRLLZu7zWv84LS0viUnW3lWjYurSwufVf3trCIS7AleFFJPFo3ZdYuBjLTYHLAngeLyKSrHHZnN1yMSiSSIhJorwlAyeZu0hcMs1jkMzn7lZ5tyxgUASQl25UEthvHHizLFzci4+fkqzdZfANSUiWfADsLNkyBon1rSFZkpZUwFJC9Ms1P250JBIUknnkk2hJ5tclWVxEMpWwjEyy1JLIXcFyygRr5MulJVkqJGSaXfckKslsimRKpll0kqmWZDYVBcwIpmTEIPnSkExnEoC8nP5fSA6zyCQzLckfCUBeXolkBjsJAtCSj8P1SP7JSU6TfMYgcTV/6mefEoC8PEQmOXxudcEwkj8xSJZeRJI4J5nMAh8kVJKJhM/oJKhK+SaAgwJUEi8OycQ5Snd/8RlK4kT+mErrvtYSiSOTODJ2UT9w0zp77kkkEsDEEcX5ivjV4WjjNrDy4L+VFxOFRDnJJOKXoAM7CSzlt98LJbEd+7iJfhAbcdi2wz5372wZwFYR4Yup2q1Kbr93sG1HEEgCjTiql7Nsdo7yAqvLneftDvbZk9j2cXHRPwsWR7WwalerjgOtSlJFO9TQ2Zwct946HN72OOFFzLGx+M0YANtB9HTG+ZNwOFWTd7Wr/sTrRQXVf4DkSEwfAB9bk4KUCzNITbGcbkm5QQBkWqZvZe86AGar1UKDWdUNwmyYOMPUpJkNXQWokio4Gn5Nw5SkJQ24zYVGqEUBsi9pFZSJi9LEXmajgYN8wBUe1CHCF2Ewy8AgGafyWpTGZ+Nrsttiey3/RYgKYYAUSe/1Gr0GUrrkDoxDYA+7LNXfZXukqtdgLutnpkAON0kUOZAur1Y9JAirXm9FhTsnRR8KoFdOg2Jq9WOMBJEWOJAqApAbBcJIo2El29XIH/BqAVAwoNfmIrg8oCgVpGQiDnVHba7YGPh32Zt2u80rZAQCQpRTKIlDqKMhdpCMbsgPzAYJMMNcKMO2VsS9Eym0T3to0F/kcyNdo+GQ2gDawt6JFI5Rjv3onxomhhR/sKRgPCXEYQiPlaSNJ4x3rkMsTyLI+l1IElfvqqItIy0+7gFZcD7p9C4KVy5P2oVchZcyB2LhHRU8CTYaVA54X1Jx+oRgmNI8s1TMGdfkMHL6p7wKN8Z/V4JxE/KEVy5VxknvP2Eop3KF0GfViulcyijH5ygbqVxavVB/Ac6k8lC8rNkhAAAAAElFTkSuQmCC`,
  },
  {
    name: 'WeChat',
    logo: `data:image/jpeg;base64,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`,
  },
  {
    name: 'Amazon Chime',
    logo: `data:image/png;base64,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`,
  },
];

export default collaborationOptions;
