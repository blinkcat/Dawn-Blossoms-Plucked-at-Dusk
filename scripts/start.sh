#!/bin/sh

# $1 查找路径，$2 目录或文件，$3 默认的文件名 
whichDoYouWant(){
	target=$(ls $1  | grep $2)
	d_array=($target)
	length=${#d_array[*]}
	if [ $length -gt 1 ]
	then
		echo "found these: ${d_array[*]}, "
		echo please input more details
		return 1
	elif [ $length -eq 0 ]
	then
		if [ $3 ]
		then
			echo $3
			return 0
		else
			echo "can not find $1/$2"
			return 1
		fi
	else
		echo ${d_array[0]}
		return 0
	fi
}

if [ $1 ]
then
	echo $1
	first_val=$(whichDoYouWant src $1)
	if [ $? -eq 0 ]
	then
		echo "directory is $first_val"
		second_val=$(whichDoYouWant "src/$first_val" "^$2.*.html" index.html)
		if [ $? -eq 0 ]
		then
			echo "file is $second_val"
			echo "running parcel src/$first_val/$second_val --open"
			parcel "src/$first_val/$second_val" --open
		else
			# 错误信息
			echo $second_val
		fi
	else
		# 错误信息
		echo $first_val
	fi
else
	echo what are you doing?
	echo try this:
	echo "yarn start <your wanted dir> [html name (default is index.html)]"
fi
